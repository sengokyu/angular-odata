import { raw } from '../../resources/query';
import {
  EnumTypeConfig,
  EnumTypeFieldConfig,
  ParserOptions,
  Parser,
} from '../../types';
import { Enums, Strings } from '../../utils';
import { ODataAnnotatable } from '../annotation';

export class ODataEnumTypeFieldParser<E> extends ODataAnnotatable {
  name: string;
  value: E;

  constructor(name: string, field: EnumTypeFieldConfig<E>) {
    super(field);
    this.name = name;
    this.value = field.value;
  }

  titleize(term?: string | RegExp): string {
    return (term && this.annotatedValue(term)) || this.name;
  }
}

export class ODataEnumTypeParser<E>
  extends ODataAnnotatable
  implements Parser<E>
{
  name: string;
  namespace: string;
  alias?: string;
  flags?: boolean;
  members: { [name: string]: E } | { [value: number]: string };
  private _fields: ODataEnumTypeFieldParser<E>[];
  stringAsEnum?: boolean;
  parserOptions?: ParserOptions;

  constructor(config: EnumTypeConfig<E>, namespace: string, alias?: string) {
    super(config);
    this.name = config.name;
    this.namespace = namespace;
    this.alias = alias;
    this.flags = config.flags;
    this.members = config.members;
    this._fields = Object.entries(config.fields).map(
      ([name, f]) => new ODataEnumTypeFieldParser(name, f)
    );
  }

  /**
   * Create a nicer looking title.
   * Titleize is meant for creating pretty output.
   * @param term The term of the annotation to find.
   * @returns The titleized string.
   */
  ttitelize(term?: string | RegExp): string {
    return (term && this.annotatedValue(term)) || Strings.titleCase(this.name);
  }

  configure({
    stringAsEnum,
    options,
  }: {
    stringAsEnum: boolean;
    options: ParserOptions;
  }) {
    this.stringAsEnum = stringAsEnum;
    this.parserOptions = options;
  }

  isTypeOf(type: string) {
    var names = [`${this.namespace}.${this.name}`];
    if (this.alias) names.push(`${this.alias}.${this.name}`);
    return names.indexOf(type) !== -1;
  }
  fields(value?: E): ODataEnumTypeFieldParser<E>[] {
    return [
      ...this._fields.filter(
        (f) => value === undefined || Boolean((<any>f.value) & (<any>value))
      ),
    ];
  }

  field(enu: string | E) {
    let field = this.fields().find((f) => f.name === enu || f.value === enu);
    //Throw error if not found
    if (field === undefined)
      throw new Error(`${this.name} has no field named ${String(name)}`);
    return field;
  }

  /**
   * Map the fields of the enum type.
   * @param mapper Function that maps the value to the new value
   * @returns The fields mapped by the mapper
   */
  mapFields<R>(mapper: (field: ODataEnumTypeFieldParser<E>) => R) {
    return this.fields().map(mapper);
  }

  // Deserialize
  deserialize(value: string, options?: ParserOptions): E {
    // string -> number
    const parserOptions = options || this.parserOptions;
    if (this.flags) {
      return Enums.toValues<E>(this.members as any, value).reduce(
        (acc, v) => acc | v,
        0
      ) as any;
    } else {
      return Enums.toValue<E>(this.members as any, value) as any;
    }
  }

  // Serialize
  serialize(value: E, options?: ParserOptions): string | undefined {
    // Enum are string | number
    // string | number -> string
    const parserOptions = options || this.parserOptions;
    if (this.flags) {
      const names = Enums.toNames(this.members, value);
      if (names.length === 0) return undefined;
      return !this.stringAsEnum
        ? `${this.namespace}.${this.name}'${names.join(', ')}'`
        : names.join(', ');
    } else {
      const name = Enums.toName(this.members, value);
      if (name === undefined) return undefined;
      return !this.stringAsEnum
        ? `${this.namespace}.${this.name}'${name}'`
        : name;
    }
  }

  //Encode
  encode(value: E, options?: ParserOptions): any {
    const parserOptions = options || this.parserOptions;
    const serialized = this.serialize(value, parserOptions);
    if (serialized === undefined) return undefined;
    return this.stringAsEnum ? raw(`'${serialized}'`) : raw(serialized);
  }

  // Json Schema
  toJsonSchema() {
    let property = <any>{
      title: this.name,
      type: 'string',
    };
    property.enum = this._fields.map((f) => f.name);
    return property;
  }

  validate(
    member: string | number,
    {
      method,
      navigation = false,
    }: {
      method?: 'create' | 'update' | 'modify';
      navigation?: boolean;
    } = {}
  ): string[] | undefined {
    if (this.flags) {
      let members = Enums.toValues(this.members, member);
      return members.some((member) => !(member in this.members))
        ? ['mismatch']
        : undefined;
    } else {
      return !(member in this.members) ? ['mismatch'] : undefined;
    }
  }
}
