import { ODataCollection } from '../models';
import { ODataModel } from '../models/model';
import { Parser, ParserOptions, StructuredTypeConfig } from '../types';
import { ODataSchemaElement } from './element';
import {
  JsonSchemaOptions,
  ODataEntityTypeKey,
  ODataStructuredTypeFieldParser,
  ODataStructuredTypeParser,
} from './parsers';
import { ODataSchema } from './schema';

export class ODataStructuredType<T> extends ODataSchemaElement {
  base?: string;
  open: boolean;
  parent?: ODataStructuredType<any>;
  children: ODataStructuredType<any>[] = [];
  model?: typeof ODataModel;
  collection?: typeof ODataCollection;
  parser: ODataStructuredTypeParser<T>;

  constructor(config: StructuredTypeConfig<T>, schema: ODataSchema) {
    super(config, schema);
    this.base = config.base;
    this.open = config.open || false;
    this.parser = new ODataStructuredTypeParser(
      config,
      schema.namespace,
      schema.alias
    );
    this.model = config.model as typeof ODataModel;
    this.collection = config.collection as typeof ODataCollection;
    if (this.model !== undefined) {
      const options = this.model.hasOwnProperty('options')
        ? this.model.options
        : { fields: {} };
      this.model.buildMeta<T>({ options, schema: this });
    }
    if (this.collection !== undefined) {
      this.collection.model = this.model;
    }
  }

  configure({
    options,
    parserForType,
    findOptionsForType,
  }: {
    options: ParserOptions;
    parserForType: (type: string) => Parser<any>;
    findOptionsForType: (type: string) => any;
  }) {
    if (this.base) {
      const parent = this.api.findStructuredTypeForType(
        this.base
      ) as ODataStructuredType<any>;
      parent.children.push(this);
      this.parent = parent;
    }
    this.parser.configure({
      options,
      parserForType,
      findOptionsForType,
    });
    if (this.model !== undefined && this.model.options !== null) {
      this.model.meta.configure({
        options,
        parserForType,
        findOptionsForType,
      });
    }
  }

  /**
   * Returns a boolean indicating if the structured type is a subtype of the given type.
   * @param type String representation of the type
   * @returns True if the callable is type of the given type
   */
  override isSubtypeOf(schema: ODataStructuredType<any>): boolean {
    return (
      super.isSubtypeOf(schema) ||
      (this.parent !== undefined && this.parent.isSubtypeOf(schema))
    );
  }

  /**
   * Returns a boolean indicating if the structured type is a supertype of the given type.
   * @param type String representation of the type
   * @returns True if the callable is type of the given type
   */
  override isSupertypeOf(schema: ODataStructuredType<any>): boolean {
    return (
      super.isSupertypeOf(schema) ||
      this.children.some((c) => c.isSupertypeOf(schema))
    );
  }

  /**
   * Returns a boolean indicating if the structured type has a simple key.
   * @returns True if the structured type has a simple key
   */
  isSimpleKey() {
    return this.keys().length === 1;
  }

  /**
   * Returns a boolean indicating if the structured type has a compound key.
   * @returns True if the structured type has a compound key.
   */
  isCompoundKey() {
    return this.keys().length > 1;
  }

  /**
   * Find the field parser for the given field name.
   * @param name Name of the field
   * @returns The field parser
   */
  field<F>(name: keyof T) {
    return this.parser.field<F>(name);
  }

  /**
   * Find a parent schema of the structured type.
   * @param predicate Function for evaluate the schemas in the hierarchy.
   * @returns The schema that matches the predicate.
   */
  findParentSchema(
    predicate: (p: ODataStructuredType<any>) => boolean
  ): ODataStructuredType<any> | undefined {
    if (predicate(this)) return this as ODataStructuredType<any>;
    if (this.parent === undefined) return undefined;
    return this.parent.findParentSchema(predicate);
  }

  /**
   * Find a parent schema of the structured type for the given field.
   * @param field Field that belongs to the structured type
   * @returns The schema of the field
   */
  findSchemaForField<E>(field: ODataStructuredTypeFieldParser<any>) {
    return this.findParentSchema(
      (p) =>
        p
          .fields({ include_parents: false, include_navigation: true })
          .find((f) => f === field) !== undefined
    ) as ODataStructuredType<E>;
  }

  /**
   * Picks the fields from attributes.
   * @param attrs
   * @param include_parents Include the parent fields
   * @param include_navigation Include the navigation fields
   * @param include_etag Include the etag field
   * @returns The picked fields
   */
  pick(
    attrs: { [name: string]: any },
    {
      include_parents = true,
      include_navigation = false,
      include_etag = true,
    }: {
      include_parents?: boolean;
      include_navigation?: boolean;
      include_etag?: boolean;
    } = {}
  ): Partial<T> {
    return this.parser.pick(attrs, {
      include_etag,
      include_navigation,
      include_parents,
      options: this.api.options,
    });
  }

  /**
   * Deseialize the given value from the structured type.
   * @param value Value to deserialize
   * @param options Options for deserialization
   * @returns Deserialized value
   */
  deserialize(value: any, options?: ParserOptions): T {
    return this.parser.deserialize(value, options);
  }

  /**
   * Serialize the given value for the structured type.
   * @param value Value to serialize
   * @param options Options for serialization
   * @returns Serialized value
   */
  serialize(value: T, options?: ParserOptions): any {
    return this.parser.serialize(value, options);
  }

  /**
   * Encode the given value for the structured type.
   * @param value Value to encode
   * @param options Options for encoding
   * @returns Encoded value
   */
  encode(value: T, options?: ParserOptions): any {
    return this.parser.encode(value, options);
  }

  /**
   * Returns all fields of the structured type.
   * @param include_navigation Include navigation properties in the result.
   * @param include_parents Include the parent types in the result.
   * @returns All fields of the structured type.
   */
  fields({
    include_navigation,
    include_parents,
  }: {
    include_parents: boolean;
    include_navigation: boolean;
  }): ODataStructuredTypeFieldParser<any>[] {
    return this.parser.fields({ include_navigation, include_parents });
  }

  /**
   * Returns the keys of the structured type.
   * @param include_parents Include the parent fields
   * @returns The keys of the structured type
   */
  keys({
    include_parents = true,
  }: {
    include_parents?: boolean;
  } = {}): ODataEntityTypeKey[] {
    return this.parser.keys({ include_parents });
  }

  /**
   * Resolve the key of the structured type for the given value.
   * @param attrs Attributes of the value
   * @returns Resolved key
   */
  resolveKey(attrs: T | { [name: string]: any }) {
    return this.parser.resolveKey(attrs);
  }

  /**
   * Returns the defaults values for the structured type.
   * @returns Default values for the structured type
   */
  defaults() {
    return this.parser.defaults();
  }

  /**
   * Convert the structured type to json schema
   * @param options Options for json schema
   * @returns Json Schema
   */
  toJsonSchema(options: JsonSchemaOptions<T> = {}) {
    return this.parser.toJsonSchema(options);
  }

  /**
   * Validate the given value against the structured type.
   * @param attrs Attributes of the value
   * @param method Method to use for the process validation
   * @returns Object with the errors
   */
  validate(
    attrs: Partial<T>,
    {
      method,
      navigation = false,
    }: {
      method?: 'create' | 'update' | 'modify';
      navigation?: boolean;
    } = {}
  ) {
    return this.parser.validate(attrs, { method, navigation });
  }
}
