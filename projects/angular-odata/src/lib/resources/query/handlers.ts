import { QueryOptionNames } from '../../types';
import { Objects, Types } from '../../utils';
import { alias, Expand, Filter, OrderBy, Select, Transform } from './builder';
import { Connector, Expression } from './expressions';
import type { ODataQueryArguments, ODataQueryOptions } from './options';
import { ODataFunctions, ODataOperators } from './syntax';

export class ODataQueryOptionHandler<T> {
  constructor(
    private o: { [name: string]: any },
    private n: QueryOptionNames
  ) {}

  get name() {
    return this.n;
  }

  toJSON() {
    return this.o[this.n];
  }

  empty() {
    return Types.isEmpty(this.o[this.n]);
  }

  //#region Primitive Value
  value(v?: any) {
    return (v !== undefined && (this.o[this.n] = v)) || this.o[this.n];
  }
  //#endregion

  //#region Array Value
  private assertArray(): any[] {
    if (!Types.isArray(this.o[this.n]))
      this.o[this.n] = this.o[this.n] !== undefined ? [this.o[this.n]] : [];
    return this.o[this.n];
  }

  push(value: any) {
    this.assertArray().push(value);
  }

  remove(value: any) {
    this.o[this.n] = this.assertArray().filter((v) => v !== value);
    // If only one... down to value
    if (this.o[this.n].length === 1) this.o[this.n] = this.o[this.n][0];
  }

  at(index: number) {
    return this.assertArray()[index];
  }
  //#endregion

  //#region HashMap Value
  private assertObject(create: boolean): { [name: string]: any } {
    if (!Types.isArray(this.o[this.n]) && Types.isPlainObject(this.o[this.n])) {
      return this.o[this.n];
    }
    let arr = this.assertArray();
    let obj = arr.find((v) => Types.isPlainObject(v));
    if (!obj && create) {
      obj = {};
      arr.push(obj);
    }
    return obj;
  }

  set(path: string, value: any) {
    let obj = this.assertObject(true);
    Objects.set(obj, path, value);
  }

  get(path: string, def?: any): any {
    let obj = this.assertObject(false) || {};
    return Objects.get(obj, path, def);
  }

  unset(path: string) {
    let obj = this.assertObject(true);
    Objects.unset(obj, path);

    if (Types.isArray(this.o[this.n])) {
      this.o[this.n] = this.o[this.n].filter((v: any) => !Types.isEmpty(v));
      if (this.o[this.n].length === 1) this.o[this.n] = this.o[this.n][0];
    }
  }

  has(path: string) {
    let obj = this.assertObject(false) || {};
    return Objects.has(obj, path);
  }

  assign(values: { [attr: string]: any }) {
    let obj = this.assertObject(true);
    return Objects.merge(obj, values);
  }
  //#endregion

  clear() {
    delete this.o[this.n];
  }
}

export class ODataQueryOptionsHandler<T> {
  constructor(protected options: ODataQueryOptions<T>) {}

  /**
   * Create a new odata alias parameter
   * @link https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_ParameterAliases
   * @param value The value of the alias
   * @param name The name of the alias
   * @returns The alias
   */
  alias(value: any, name?: string) {
    return alias(value, name);
  }

  select(opts: Select<T>): ODataQueryOptionHandler<T>;
  select(): ODataQueryOptionHandler<T>;
  select(opts?: Select<T>): any {
    return this.options.option<Select<T>>(QueryOptionNames.select, opts);
  }

  expand(opts: Expand<T>): ODataQueryOptionHandler<T>;
  expand(): ODataQueryOptionHandler<T>;
  expand(opts?: Expand<T>): any {
    return this.options.option<Expand<T>>(QueryOptionNames.expand, opts);
  }

  /**
   * @link https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_SystemQueryOptioncompute
   */
  compute(
    opts: (e: { e: Expression<T>; not: typeof Expression.not }) => Expression<T>
  ): Expression<T>;
  compute(opts: string): ODataQueryOptionHandler<T>;
  compute(): ODataQueryOptionHandler<T>;
  compute(opts?: any): any {
    if (Types.isFunction(opts)) {
      return this.options.expression(
        QueryOptionNames.compute,
        opts({
          e: () => Expression.e<T>(),
          not: (e: Expression<T>) => Expression.not(e),
        }) as Expression<T>
      );
    }
    return this.options.option<string>(QueryOptionNames.compute, opts);
  }

  /**
   * @link https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_SystemQueryOptionformat
   */
  format(opts: string): ODataQueryOptionHandler<T>;
  format(): ODataQueryOptionHandler<T>;
  format(opts?: string): any {
    return this.options.option<string>(QueryOptionNames.format, opts);
  }

  transform(opts: Transform<T>): ODataQueryOptionHandler<T>;
  transform(): ODataQueryOptionHandler<T>;
  transform(opts?: Transform<T>): any {
    return this.options.option<Transform<T>>(QueryOptionNames.transform, opts);
  }

  search(opts: string): ODataQueryOptionHandler<T>;
  search(): ODataQueryOptionHandler<T>;
  search(opts?: string): any {
    return this.options.option<string>(QueryOptionNames.search, opts);
  }

  filter(
    opts: (e: {
      s: T;
      e: (connector?: Connector) => Expression<T>;
      o: ODataOperators<T>;
      f: ODataFunctions<T>;
    }) => Expression<T>
  ): Expression<T>;
  filter(opts: Filter<T>): ODataQueryOptionHandler<T>;
  filter(): ODataQueryOptionHandler<T>;
  filter(opts?: any): any {
    if (Types.isFunction(opts)) {
      return this.options.expression(
        QueryOptionNames.filter,
        opts({
          s: Expression.s,
          e: Expression.e,
          o: Expression.o,
          f: Expression.f,
        }) as Expression<T>
      );
    }
    return this.options.option<Filter<T>>(QueryOptionNames.filter, opts);
  }

  orderBy(
    opts: (e: {
      e: () => Expression<T>;
      not: (e: Expression<T>) => Expression<T>;
    }) => Expression<T>
  ): Expression<T>;
  orderBy(opts: OrderBy<T>): ODataQueryOptionHandler<T>;
  orderBy(): ODataQueryOptionHandler<T>;
  orderBy(opts?: any): any {
    if (Types.isFunction(opts)) {
      return this.options.expression(
        QueryOptionNames.orderBy,
        opts({
          e: () => Expression.e<T>(),
          not: (e: Expression<T>) => Expression.not(e),
        }) as Expression<T>
      );
    }
    return this.options.option<OrderBy<T>>(QueryOptionNames.orderBy, opts);
  }

  top(opts: number): ODataQueryOptionHandler<T>;
  top(): ODataQueryOptionHandler<T>;
  top(opts?: number): any {
    return this.options.option<number>(QueryOptionNames.top, opts);
  }

  skip(opts: number): ODataQueryOptionHandler<T>;
  skip(): ODataQueryOptionHandler<T>;
  skip(opts?: number): any {
    return this.options.option<number>(QueryOptionNames.skip, opts);
  }

  skiptoken(opts: string): ODataQueryOptionHandler<T>;
  skiptoken(): ODataQueryOptionHandler<T>;
  skiptoken(opts?: string): any {
    return this.options.option<string>(QueryOptionNames.skiptoken, opts);
  }

  paging({
    skip,
    skiptoken,
    top,
  }: { skip?: number; skiptoken?: string; top?: number } = {}) {
    if (skiptoken !== undefined) this.skiptoken(skiptoken);
    else if (skip !== undefined) this.skip(skip);
    if (top !== undefined) this.top(top);
  }

  clearPaging() {
    this.skip().clear();
    this.top().clear();
    this.skiptoken().clear();
  }

  apply(query: ODataQueryArguments<T>) {
    if (query.select !== undefined) {
      this.select(query.select);
    }
    if (query.expand !== undefined) {
      this.expand(query.expand);
    }
    if (query.transform !== undefined) {
      this.transform(query.transform);
    }
    if (query.search !== undefined) {
      this.search(query.search);
    }
    if (query.filter !== undefined) {
      this.filter(query.filter);
    }
    if (query.orderBy !== undefined) {
      this.orderBy(query.orderBy);
    }
    this.paging(query);
  }
}
