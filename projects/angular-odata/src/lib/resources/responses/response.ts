import { HttpHeaders } from '@angular/common/http';
import { ODataEntityMeta, ODataEntitiesMeta, ODataPropertyMeta } from './meta';
import { Parser } from '../../types';
import { Types } from '../../utils/types';
import { ODataResource } from '../resource';
import { ODataEntityParser } from '../../parsers/entity';
import { ODataEntities, ODataEntity, ODataProperty } from './types';
import { APPLICATION_JSON, ODATA_VERSION_HEADERS, CONTENT_TYPE } from '../../constants';
import { ODataOptions } from '../../options';
import { ODataApi } from '../../api';

export class ODataResponse<T> {
  readonly body: any | null;
  readonly api: ODataApi;
  readonly headers: HttpHeaders;
  readonly status: number;
  readonly statusText: string;
  readonly resource: ODataResource<T>;

  constructor(init: {
    api: ODataApi;
    body: any | null;
    headers: HttpHeaders;
    status: number;
    statusText: string;
    resource: ODataResource<T>;
  }) {
    this.body = init.body;
    this.api = init.api;
    this.headers = init.headers;
    this.status = init.status;
    this.statusText = init.statusText;
    this.resource = init.resource;
  }

  _options: ODataOptions | null = null;
  get options(): ODataOptions {
    if (this._options === null) {
      this._options = this.api.options.clone();
      const contentType = this.headers.get(CONTENT_TYPE);
      if (contentType && contentType.indexOf(APPLICATION_JSON) !== -1) {
        const features = contentType.split(",").find(p => p.startsWith(APPLICATION_JSON)) as string;
        this._options.setFeatures(features);
      }
      const key = this.headers.keys().find(k => ODATA_VERSION_HEADERS.indexOf(k) !== -1);
      if (key) {
        const version = (this.headers.get(key) || "").replace(/\;/g, "") as '2.0' | '3.0' | '4.0';
        this._options.setVersion(version);
      }
    }
    return this._options;
  }

  private parse(parser: Parser<T>, value: any): any {
    const type = Types.isObject(value) ? this.options.helper.type(value) : undefined;
    if (type !== undefined && parser instanceof ODataEntityParser) {
      parser = parser.findParser(c => c.isTypeOf(type));
    }
    return parser.deserialize(value, this.options);
  }

  private deserialize(type: string, value: any): any {
    const parser = this.api.findParserForType<T>(type);
    if (parser !== undefined && 'deserialize' in parser)
      return Array.isArray(value) ?
        value.map(v => this.parse(parser, v)) :
        this.parse(parser, value);
    return value;
  }

  entity(): ODataEntity<T> {
    const payload = this.body && this.options.version === "2.0" ? this.body["d"] : this.body;
    const meta = new ODataEntityMeta(payload || {}, {options: this.options, headers: this.headers});
    const type = this.resource.type();
    const entity = payload ?
      (type !== null ? this.deserialize(type, meta.data(payload)) : payload) as T:
      null;
    return { entity, meta };
  }

  entities(): ODataEntities<T> {
    const payload = this.options.version === "2.0" ? this.body["d"] : this.body;
    const meta = new ODataEntitiesMeta(payload || {}, {options: this.options, headers: this.headers});
    const type = this.resource.type();
    const entities = payload ?
      (type !== null ? this.deserialize(type, meta.data(payload)) : payload) as T[]:
      null;
    return { entities, meta };
  }

  property(): ODataProperty<T> {
    const payload = this.options.version === "2.0" ? this.body["d"] : this.body;
    const meta = new ODataPropertyMeta(payload || {}, {options: this.options, headers: this.headers});
    const type = this.resource.type();
    const property = payload ?
      (type !== null ? this.deserialize(type, meta.data(payload)) : payload) as T:
      null;
    return { property, meta };
  }

  value(): T | null {
    const payload = this.body && this.options.version === "2.0" ? this.body : this.body;
    const type = this.resource.type();
    return payload ?
      (type !== null ? this.deserialize(type, payload) : payload) as T:
      null;
  }
}
