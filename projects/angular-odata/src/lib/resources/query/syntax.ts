import type { QueryCustomType } from './builder';
import { normalizeValue } from './builder';

export interface Renderable {
  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape?: boolean;
  }): string;
  toString(): string;
  toJSON(): any;
}

export type Funcs<T> = (
  x: ODataSyntax<T>
) => Function<T> | Operator<T> | Grouping<T>;
//export type Field<T> = keyof T | Funcs<keyof T>;

export class Field<T extends object> implements ProxyHandler<T> {
  static factory<T extends object>() {
    const h = new Field<T>();
    return new Proxy({ _field: h } as T & { _field: Field<T> }, h);
  }

  names: string[] = [];
  get(target: T, p: string | symbol): any {
    if (p === 'render') {
      return this.render.bind(this);
    }
    let h = (target as any)['_field'];
    h.push(p);
    return new Proxy({ _field: this } as any & { _field: Field<any> }, this);
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape?: boolean;
  }): string {
    return this.names.join('/');
  }

  push(field: string) {
    this.names.push(field);
  }
}

function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}

function render(
  value: any,
  {
    aliases,
    normalize,
    escape,
  }: {
    aliases?: QueryCustomType[];
    normalize?: boolean;
    escape?: boolean;
  } = {}
): string | number | boolean | null {
  if (typeof value === 'function') {
    return render(value(syntax), { aliases, normalize });
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    value.render !== undefined
  ) {
    return render(value.render({ aliases, escape }), {
      aliases,
      normalize,
      escape,
    });
  }
  return normalize ? normalizeValue(value, { aliases, escape }) : value;
}

export class Function<T> implements Renderable {
  constructor(
    protected name: string,
    protected values: any[],
    protected normalize: boolean = true,
    protected escape: boolean = false
  ) {}

  get [Symbol.toStringTag]() {
    return 'Function';
  }

  toJSON() {
    return {
      name: this.name,
      values: this.values,
      normalize: this.normalize,
    };
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape?: boolean;
  }): string {
    let [field, ...values] = this.values;

    field = render(field);
    let params = [
      field,
      ...values.map((v) =>
        render(v, { aliases, escape, normalize: this.normalize })
      ),
    ];
    return `${this.name}(${params.join(', ')})`;
  }
}

export class StringAndCollectionFunctions<T> {
  concat(field: any, value: any, normalize?: boolean) {
    return new Function<T>('concat', [field, value], normalize);
  }

  contains(field: any, value: any, normalize?: boolean) {
    return new Function<T>('contains', [field, value], normalize);
  }

  endsWith(field: any, value: any, normalize?: boolean) {
    return new Function<T>('endswith', [field, value], normalize);
  }

  indexOf(field: any, value: any, normalize?: boolean) {
    return new Function<T>('indexof', [field, value], normalize);
  }

  length(value: any, normalize?: boolean) {
    return new Function<T>('length', [value], normalize);
  }

  startsWith(field: any, value: any, normalize?: boolean) {
    return new Function<T>('startswith', [field, value], normalize);
  }

  subString(field: any, start: number, length?: number) {
    let values = [field, start];
    if (length !== undefined) {
      values.push(length);
    }
    return new Function<T>('substring', values);
  }
}

export class CollectionFunctions<T> {
  hasSubset(s1: T, s2: any) {
    return new Function<T>('hassubset', [s1, s2]);
  }
  hasSubsequence(s1: T, s2: any) {
    return new Function<T>('hassubsequence', [s1, s2]);
  }
}

export class StringFunctions<T> {
  matchesPattern(value: T | string, pattern: string) {
    return new Function<T>('matchesPattern', [value, pattern]);
  }
  toLower(value: T) {
    return new Function<T>('tolower', [value]);
  }
  toUpper(value: T) {
    return new Function<T>('toupper', [value]);
  }
  trim(value: T) {
    return new Function<T>('trim', [value]);
  }
}

export class DateAndTimeFunctions<T> {
  date(value: T) {
    return new Function<T>('date', [value]);
  }
  day(value: T) {
    return new Function<T>('day', [value]);
  }
  fractionalseconds(value: T) {
    return new Function<T>('fractionalseconds', [value]);
  }
  hour(value: T) {
    return new Function<T>('hour', [value]);
  }
  maxdatetime(value: T) {
    return new Function<T>('maxdatetime', [value]);
  }
  mindatetime(value: T) {
    return new Function<T>('mindatetime', [value]);
  }
  minute(value: T) {
    return new Function<T>('minute', [value]);
  }
  month(value: T) {
    return new Function<T>('month', [value]);
  }
  now() {
    return new Function<T>('now', []);
  }
  second(value: T) {
    return new Function<T>('second', [value]);
  }
  time(value: T) {
    return new Function<T>('time', [value]);
  }
  totaloffsetminutes(value: T) {
    return new Function<T>('totaloffsetminutes', [value]);
  }
  totalseconds(value: T) {
    return new Function<T>('totalseconds', [value]);
  }
  year(value: T) {
    return new Function<T>('year', [value]);
  }
}

export class ArithmeticFunctions<T> {
  ceiling(value: T | string) {
    return new Function<T>('ceiling', [value]);
  }
  floor(value: T | string) {
    return new Function<T>('floor', [value]);
  }
  round(value: T | string) {
    return new Function<T>('round', [value]);
  }
}

export class TypeFunctions<T> {
  cast(value: T | string, type?: string) {
    return new Function<T>('cast', [value, type]);
  }

  isof(value: T | string, type?: string) {
    return new Function<T>('isof', [value, type]);
  }
}

export class GeoFunctions<T> {
  geoDistance(value: T, point: string, normalize?: boolean) {
    return new Function<T>('geo.distance', [value, point], normalize);
  }
  geoIntersects(value: T, polygon: string, normalize?: boolean) {
    return new Function<T>('geo.intersects', [value, polygon], normalize);
  }
  geoLength(line: T, normalize?: boolean) {
    return new Function<T>('geo.length', [line], normalize);
  }
}

export class ConditionalFunctions<T> {
  case(condition: T | string, value: any) {
    return new Function<T>('case', [condition, value]);
  }
}

export class Operator<T> implements Renderable {
  constructor(
    protected op: string,
    protected values: any[],
    protected normalize: boolean = true
  ) {}

  get [Symbol.toStringTag]() {
    return 'Operator';
  }

  toJSON() {
    return {
      op: this.op,
      values: this.values,
      normalize: this.normalize,
    };
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape: boolean;
  }): string {
    let [left, right] = this.values;

    left = render(left, { aliases, escape });
    if (right !== undefined) {
      right = Array.isArray(right)
        ? `(${right
            .map((v) =>
              render(v, {
                aliases,
                escape,
                normalize: this.normalize,
              })
            )
            .join(',')})`
        : render(right, {
            aliases,
            escape,
            normalize: this.normalize,
          });
      return `${left} ${this.op} ${right}`;
    }
    return `${this.op}(${left})`;
  }
}

export class LogicalOperators<T> {
  eq(left: any, right: any, normalize?: boolean) {
    return new Operator('eq', [left, right], normalize);
  }
  ne(left: any, right: any, normalize?: boolean) {
    return new Operator('ne', [left, right], normalize);
  }
  gt(left: any, right: any, normalize?: boolean) {
    return new Operator('gt', [left, right], normalize);
  }
  ge(left: any, right: any, normalize?: boolean) {
    return new Operator('ge', [left, right], normalize);
  }
  lt(left: any, right: any, normalize?: boolean) {
    return new Operator('lt', [left, right], normalize);
  }
  le(left: any, right: any, normalize?: boolean) {
    return new Operator('le', [left, right], normalize);
  }
  /*
  and(left: any, right: any, normalize?: boolean) {
    return new Operator('and', [left, right], normalize);
  }
  or(left: any, right: any, normalize?: boolean) {
    return new Operator('or', [left, right], normalize);
  }
  */
  not(value: any, normalize?: boolean) {
    return new Operator<T>('not', [value], normalize);
  }
  has(left: any, right: any, normalize?: boolean) {
    return new Operator('has', [left, right], normalize);
  }
  in(left: any, right: any, normalize?: boolean) {
    return new Operator('in', [left, right], normalize);
  }
}

export class ArithmeticOperators<T> {
  add(left: any, right: any, normalize?: boolean) {
    return new Operator<T>('add', [left, right], normalize);
  }
  sub(left: any, right: any, normalize?: boolean) {
    return new Operator('sub', [left, right], normalize);
  }
  mul(left: any, right: any, normalize?: boolean) {
    return new Operator('mul', [left, right], normalize);
  }
  div(left: any, right: any, normalize?: boolean) {
    return new Operator('div', [left, right], normalize);
  }
  mod(left: any, right: any, normalize?: boolean) {
    return new Operator('mod', [left, right], normalize);
  }
  neg(value: any, normalize?: boolean) {
    return new Operator('-', [value], normalize);
  }
}

export class Grouping<T> implements Renderable {
  constructor(protected group: Renderable) {}

  get [Symbol.toStringTag]() {
    return 'Grouping';
  }

  toJSON() {
    return {
      group: this.group.toJSON(),
    };
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape: boolean;
  }): string {
    return `(${render(this.group, { aliases })})`;
  }
}

/*
export class Navigation<T, N> implements Renderable {
  constructor(protected field: T, protected value: Field<N>) {}

  get [Symbol.toStringTag]() {
    return 'Navigation';
  }

  toJSON() {
    return {
      field: this.field,
      value: this.value,
    };
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape: boolean;
  }): string {
    return `${this.field}/${render(this.value, { aliases, escape })}`;
  }
}
*/

export class GroupingOperators<T> {
  grouping(value: any) {
    return new Grouping(value);
  }

  /*
  navigation<N>(field: T, value: Field<N>) {
    return new Navigation<T, N>(field, value);
  }
  */
}

export class Lambda<T> extends Operator<T> {
  constructor(
    protected op: string,
    protected values: any[],
    protected normalize: boolean = true
  ) {
    super(op, values, normalize);
  }

  get [Symbol.toStringTag]() {
    return 'Lambda';
  }

  render({
    aliases,
    escape,
  }: {
    aliases?: QueryCustomType[];
    escape: boolean;
  }): string {
    let [left, right] = this.values;

    left = render(left, { aliases, escape });
    let alias = left.split('/').pop().toLowerCase();
    return `${left}/${this.op}(${alias}:${alias}/${render(right, {
      aliases,
      escape,
    })})`;
  }
}

export class LambdaOperators<T> {
  any(field: T, value: any) {
    return new Lambda('any', [field, value]);
  }

  all(field: T, value: any) {
    return new Lambda('all', [field, value]);
  }
}

export class ODataOperators<T> {}
export interface ODataOperators<T>
  extends LogicalOperators<T>,
    ArithmeticOperators<T>,
    GroupingOperators<T>,
    LambdaOperators<T> {}

applyMixins(ODataOperators, [
  LogicalOperators,
  ArithmeticOperators,
  GroupingOperators,
  LambdaOperators,
]);
export const operators: ODataOperators<any> = new ODataOperators<any>();

export class ODataFunctions<T> {}
export interface ODataFunctions<T>
  extends StringAndCollectionFunctions<T>,
    CollectionFunctions<T>,
    StringFunctions<T>,
    DateAndTimeFunctions<T>,
    ArithmeticFunctions<T>,
    TypeFunctions<T>,
    GeoFunctions<T>,
    ConditionalFunctions<T> {}

applyMixins(ODataFunctions, [
  StringAndCollectionFunctions,
  CollectionFunctions,
  StringFunctions,
  DateAndTimeFunctions,
  ArithmeticFunctions,
  TypeFunctions,
  GeoFunctions,
  ConditionalFunctions,
]);
export const functions: ODataFunctions<any> = new ODataFunctions<any>();

export class ODataSyntax<T> {}
export interface ODataSyntax<T> extends ODataOperators<T>, ODataFunctions<T> {}
applyMixins(ODataSyntax, [ODataOperators, ODataFunctions]);

export const syntax: ODataSyntax<any> = new ODataSyntax<any>();
