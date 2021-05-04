import { JsonSchemaOptions, ODataEntityTypeKey, ODataStructuredTypeFieldParser, ODataStructuredTypeParser } from '../parsers';
import { Annotation, EntityKey, Parser, StructuredTypeConfig } from '../types';
import { Objects } from '../utils/objects';
import { ODataAnnotation } from './annotation';
import { ODataSchema } from './schema';

export class ODataStructuredType<T> {
  schema: ODataSchema;
  name: string;
  model?: { new(entity?: Partial<T> | {[name: string]: any}, ...params: any[]): any };
  collection?: { new(entities?: Partial<T>[] | {[name: string]: any}[], ...params: any[]): any };
  parser: ODataStructuredTypeParser<T>;
  annotations: ODataAnnotation[];

  constructor(config: StructuredTypeConfig<T>, schema: ODataSchema) {
    this.schema = schema;
    this.name = config.name;
    this.model = config.model;
    this.collection = config.collection;
    this.parser = new ODataStructuredTypeParser(config, schema.namespace, schema.alias);
    this.annotations = (config.annotations || []).map(annot => new ODataAnnotation(annot));
  }

  configure(settings: { findParserForType: (type: string) => Parser<any> }) {
    const parserSettings = Object.assign({ options: this.api.options }, settings);
    this.parser.configure(parserSettings);
  }

  type({alias = false}: {alias?: boolean} = {}) {
    return `${alias ? this.schema.alias : this.schema.namespace}.${this.name}`;
  }

  isTypeOf(type: string) {
    return this.parser.isTypeOf(type);
  }

  get api() {
    return this.schema.api;
  }

  findAnnotation(predicate: (annot: Annotation) => boolean) {
    return this.annotations.find(predicate);
  }

  fields(opts: {
    include_parents?: boolean,
    include_navigation?: boolean
  } = { include_navigation: false, include_parents: true }): ODataStructuredTypeFieldParser<any>[] {
    let parent = this.parser as ODataStructuredTypeParser<any> | undefined;
    let fields = <ODataStructuredTypeFieldParser<any>[]>[];
    while (parent !== undefined) {
      fields = [
        ...parent.fields.filter(field => opts.include_navigation || !field.navigation),
        ...fields
      ];
      if (!opts.include_parents)
        break;
      parent = parent.parent;
    }
    return fields;
  }

  keys(opts: {
    include_parents?: boolean
  } = { include_parents: true }): ODataEntityTypeKey[] {
    let parent = this.parser as ODataStructuredTypeParser<any> | undefined;
    let keys = <ODataEntityTypeKey[]>[];
    while (parent !== undefined) {
      keys = [
        ...parent.keys || [],
        ...keys
      ];
      if (!opts.include_parents)
        break;
      parent = parent.parent;
    }
    return keys;
  }

  pick(value: { [name: string]: any }, opts: {
    include_parents?: boolean,
    include_navigation?: boolean,
    include_etag?: boolean
  } = { include_navigation: false, include_parents: true, include_etag: true }): Partial<T> {
    const names = this.fields(opts).map(f => f.name);
    let attrs = Object.keys(value)
      .filter(k => names.indexOf(k) !== -1)
      .reduce((acc, k) => Object.assign(acc, { [k]: value[k] }), {});
    if (opts.include_etag) {
      const etag = this.api.options.helper.etag(value);
      this.api.options.helper.etag(attrs, etag);
    }
    return attrs;
  }

  deserialize(value: any): T {
    return this.parser.deserialize(value, this.api.options);
  }

  serialize(value: T): any {
    return this.parser.serialize(value, this.api.options);
  }

  resolveKey(attrs: any) {
    return this.parser.resolveKey(attrs);
  }

  defaults() {
    return this.parser.defaults();
  }

  toJsonSchema(options: JsonSchemaOptions<T> = {}) {
    return this.parser.toJsonSchema(options);
  }

  validate(attrs: Partial<T>, {create = false, patch = false}: {create?: boolean, patch?: boolean} = {}) {
    return this.parser.validate(attrs, {create, patch});
  }
}
