import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ODataOptions } from './options';
import { PlainObject, VALUE } from '../types';
import { ODataSegments } from './segments';
import { ODataClient } from '../client';
import { Schema, Parser } from '../schema';
import { ODataCollection, ODataValue } from './responses';

export abstract class ODataResource<Type> {
  public static readonly QUERY_SEPARATOR = '?';

  // VARIABLES
   protected client: ODataClient;
   protected segments: ODataSegments;
   protected options: ODataOptions;
   protected parser: Parser<Type> 

  constructor(
    client: ODataClient,
    segments?: ODataSegments,
    options?: ODataOptions,
    parser?: Parser<Type>
  ) {
    this.client = client;
    this.segments = segments || new ODataSegments();
    this.options = options || new ODataOptions();
    this.parser = parser || new Schema<Type>();
  }

  // Client Requests
  protected get(options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'text'|'json'|'entity'|'entityset'|'property',
    withCredentials?: boolean
  } = {}): Observable<any> {
    return this.client.get(this, options as any);
  }

  protected post(body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'text'|'json'|'entity'|'entityset'|'property',
    withCredentials?: boolean
  } = {}): Observable<any> {
    return this.client.post(this, body, options as any);
  }

  protected patch(body: any|null, options: {
    etag?: string, 
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'text'|'json'|'entity'|'entityset'|'property',
    withCredentials?: boolean
  } = {}): Observable<any> {
    return this.client.patch(this, body, options as any);
  }

  protected put(body: any|null, options: {
    etag?: string, 
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'text'|'json'|'entity'|'entityset'|'property',
    withCredentials?: boolean
  } = {}): Observable<any> {
    return this.client.put(this, body, options as any);
  }

  protected delete(options: {
    etag?: string, 
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body' | 'events' | 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'text'|'json'|'entity'|'entityset'|'property',
    withCredentials?: boolean
  } = {}): Observable<any> {
    return this.client.delete(this, options as any);
  }

  type(): string {
    return this.parser.type;
  }

  path(): string {
    return this.segments.path();
  }

  params(): PlainObject {
    return this.options.params();
  }

  serialize(obj: Type | Partial<Type>): any {
    return this.parser.toJSON(obj);
  }

  deserializeSingle(body: any, resource?: ODataResource<any>): Type {
    return this.parser.parse(body, resource || this.clone()) as Type;
  }

  deserializeCollection(body: any, resource?: ODataResource<any>): ODataCollection<Type> {
    body[VALUE] = this.parser.parse(body[VALUE], resource || this.clone()) as Type;
    return new ODataCollection<any>(body);
  }

  deserializeValue(body: any, resource?: ODataResource<any>): ODataValue<Type> {
    body[VALUE] = this.parser.parse(body[VALUE], resource || this.clone()) as Type;
    return new ODataValue<any>(body);
  }

  toString(): string {
    let path = this.path();
    let queryString = Object.entries(this.params())
      .map(e => `${e[0]}${ODataOptions.VALUE_SEPARATOR}${e[1]}`)
      .join(ODataOptions.PARAM_SEPARATOR);
    return queryString ? `${path}${ODataResource.QUERY_SEPARATOR}${queryString}` : path
  }

  clone<T>(
    type?: { new(client: ODataClient, segments: ODataSegments, options: ODataOptions, parser: Parser<Type>): ODataResource<T>; }
  ): ODataResource<T> {
    if (!type) 
      type = this.constructor as { new(service: ODataClient, segments: ODataSegments, options: ODataOptions, parser: Parser<Type>): ODataResource<T>; };
    return new type(this.client, this.segments.clone(), this.options.clone(), this.parser) as ODataResource<T>;
  };

  toJSON() {
    return {
      segments: this.segments.toJSON(),
      params: this.options.toJSON()
    }
  }

  static fromJSON<T>(
    client: ODataClient, 
    json: {segments: any[], options: PlainObject},
    type?: { new(client: ODataClient, segments: ODataSegments, options: ODataOptions, parser: Parser<T>): ODataResource<T>; },
    parser?: Parser<T>
  ): ODataResource<T> {
    if (!type) 
      type = this.constructor as { new(client: ODataClient, segments: ODataSegments, options: ODataOptions, parser: Parser<T>): ODataResource<T>; };
    return new type(client, new ODataSegments(json.segments || []), new ODataOptions(json.options || {}), parser) as ODataResource<T>;
  }

  is(type: string) {
    return this.segments.last().type === type;
  }
}

