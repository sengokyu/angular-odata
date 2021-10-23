import { Function, ODataSyntax, Operator } from './syntax';

export enum Connector {
  AND = 'and',
  OR = 'or',
}

export interface Renderable {
  render(): string;
}

export type Funcs<T> = (x: ODataSyntax<T>) => Function<T> | Operator<T>;
export type Field<T> = keyof T | Funcs<keyof T>;
