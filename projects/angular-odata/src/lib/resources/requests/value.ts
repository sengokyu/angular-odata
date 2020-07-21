import { Observable } from 'rxjs';

import { ODataResource } from '../resource';
import { ODataPathSegments, PathSegmentNames } from '../path-segments';
import { ODataQueryOptions } from '../query-options';
import { ODataClient } from '../../client';
import { $VALUE } from '../../types';
import { HttpOptions } from '../http-options';
import { ODataEntityParser } from '../../parsers/index';

export class ODataValueResource<T> extends ODataResource<T> {
  //#region Factory
  static factory<V>(client: ODataClient, type: string, segments: ODataPathSegments, options: ODataQueryOptions) {
    segments.segment(PathSegmentNames.value, $VALUE).setType(type);
    options.clear();
    return new ODataValueResource<V>(client, segments, options);
  }
  //#endregion

  //#region Requests
  arraybuffer(options?: HttpOptions): Observable<ArrayBuffer> {
    return super.get(
      Object.assign<HttpOptions, HttpOptions>(<HttpOptions>{ responseType: 'arraybuffer' }, options || {})
    );
  }

  blob(options?: HttpOptions): Observable<Blob> {
    return super.get(
      Object.assign<HttpOptions, HttpOptions>(<HttpOptions>{ responseType: 'blob' }, options || {})
    );
  }

  get(options?: HttpOptions): Observable<T> {
    let parser = this.client.parserFor(this);
    return super.get(
      (parser instanceof ODataEntityParser) ?
        Object.assign<HttpOptions, HttpOptions>(<HttpOptions>{ responseType: 'json' }, options || {}) :
        Object.assign<HttpOptions, HttpOptions>(<HttpOptions>{ responseType: 'text' }, options || {})
    );
  }
  //#endregion
}
