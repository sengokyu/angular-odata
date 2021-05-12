import { Observable } from 'rxjs';

import { ODataResource } from '../resource';
import { ODataPathSegments, PathSegmentNames } from '../path-segments';
import { ODataQueryOptions } from '../query-options';
import { HttpOptions } from './options';
import { $VALUE } from '../../constants';
import { ODataApi } from '../../api';

export class ODataValueResource<T> extends ODataResource<T> {
  //#region Factory
  static factory<V>(api: ODataApi, type: string | undefined, segments: ODataPathSegments, options: ODataQueryOptions) {
    const segment = segments.add(PathSegmentNames.value, $VALUE);
    if (type)
      segment.type(type);
    options.clear();
    return new ODataValueResource<V>(api, segments, options);
  }

  clone() {
    return new ODataValueResource<T>(this.api, this.cloneSegments(), this.cloneQuery());
  }
  //#endregion

  //#region Requests
  fetch(options: HttpOptions = {}): Observable<T> {
    return super.get({responseType: 'value', ...options});
  }

  fetchArraybuffer(options: HttpOptions = {}): Observable<ArrayBuffer> {
    return super.get({responseType: 'arraybuffer', ...options});
  }

  fetchBlob(options: HttpOptions = {}): Observable<Blob> {
    return super.get({responseType: 'blob', ...options});
  }
  //#endregion
}
