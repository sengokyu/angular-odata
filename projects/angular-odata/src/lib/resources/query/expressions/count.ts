import { QueryOptionNames } from '../../../types';
import { Objects, Types } from '../../../utils';
import type { QueryCustomType } from '../builder';
import { Expression } from './base';
import { FilterExpression, FilterExpressionBuilder } from './filter';
import { render, Field, Renderable } from './syntax';

export class CountField<T extends object> implements Renderable {
  constructor(
    protected field: any,
    private values: { [name: string]: any } = {}
  ) {}

  get [Symbol.toStringTag]() {
    return 'CountField';
  }

  toJSON() {
    return {
      field: this.field.toJSON(),
    };
  }

  render({
    aliases,
    escape,
    prefix,
  }: {
    aliases?: QueryCustomType[];
    escape?: boolean;
    prefix?: string;
  }): string {
    const params: { [key: string]: string } = [
      QueryOptionNames.filter,
      QueryOptionNames.search,
    ]
      .filter((key) => !Types.isEmpty(this.values[key]))
      .reduce((acc, key) => {
        let value: any = this.values[key];
        if (Types.rawType(value).endsWith('Expression')) {
          value = (value as Expression<T>).render({ aliases, prefix, escape });
        }
        return Object.assign(acc, { [key]: value });
      }, {});
    let count = `${render(this.field, { aliases, escape, prefix })}/$count`;
    if (!Types.isEmpty(params)) {
      count = `${count}(${Object.keys(params)
        .map((key) => `$${key}=${params[key]}`)
        .join(';')})`;
    }
    return count;
  }

  filter(
    opts: (
      builder: FilterExpressionBuilder<T>,
      current?: FilterExpression<T>
    ) => FilterExpression<T>
  ) {
    return this.option(
      QueryOptionNames.filter,
      FilterExpression.filter<T>(opts, this.values[QueryOptionNames.filter])
    );
  }

  clone() {
    const values = Object.keys(this.values).reduce(
      (acc, key) =>
        Object.assign(acc, { [key]: Objects.clone(this.values[key]) }),
      {}
    );
    return new CountField(this.field.clone(), values);
  }

  // Option Handler
  private option<O>(name: QueryOptionNames, opts?: O) {
    if (opts !== undefined) this.values[name] = opts;
    return this.values[name];
  }
}

export type CountExpressionBuilder<T> = {
  t: Readonly<Required<T>>;
  e: () => CountExpression<T>;
};
export class CountExpression<T> extends Expression<T> {
  constructor({
    children,
  }: {
    children?: Renderable[];
  } = {}) {
    super({ children });
  }

  static count<T extends object>(
    opts: (
      builder: CountExpressionBuilder<T>,
      current?: CountExpression<T>
    ) => CountExpression<T>,
    current?: CountExpression<T>
  ): CountExpression<T> {
    return opts(
      {
        t: Field.factory<Readonly<Required<T>>>(),
        e: () => new CountExpression<T>(),
      },
      current
    ) as CountExpression<T>;
  }

  private _add(node: Renderable): CountExpression<T> {
    this._children.push(node);
    return this;
  }

  render({
    aliases,
    escape,
    prefix,
  }: {
    aliases?: QueryCustomType[] | undefined;
    escape?: boolean | undefined;
    prefix?: string | undefined;
  } = {}): string {
    let content = this._children
      .map((n) => n.render({ aliases, escape, prefix }))
      .join(`,`);
    return content;
  }

  clone() {
    return new CountExpression({
      children: this._children.map((c) => c.clone()),
    });
  }

  field<F extends Object>(
    field: F[],
    opts?: (e: { t: F; f: CountField<F> }) => CountExpression<F>
  ): CountExpression<F> {
    let countField = new CountField<F>(field);
    if (opts !== undefined)
      opts({
        t: Field.factory<Readonly<Required<F>>>(),
        f: countField,
      });
    return this._add(countField);
  }
}
