import { $VALUE } from '../../constants';
import { ODataApi } from '../../api';
import { ODataOptions } from './options';
import { ODataPathSegments } from '../path';
import { ODataQueryOptions } from '../query';
import { ODataResource } from '../resource';
import { Observable } from 'rxjs';
import { PathSegmentNames } from '../../types';

export class ODataValueResource<T> extends ODataResource<T> {
  //#region Factory
  static factory<V>(
    api: ODataApi,
    type: string | undefined,
    segments: ODataPathSegments,
    options: ODataQueryOptions<V>
  ) {
    const segment = segments.add(PathSegmentNames.value, $VALUE);
    if (type) segment.type(type);
    options.clear();
    return new ODataValueResource<V>(api, segments, options);
  }

  clone() {
    return new ODataValueResource<T>(
      this.api,
      this.cloneSegments(),
      this.cloneQuery<T>()
    );
  }
  //#endregion

  schema() {
    return undefined;
  }

  //#region Requests
  protected get(options?: ODataOptions): Observable<T> {
    return super.get({ responseType: 'value', ...options });
  }
  //#endregion

  //#region Shortcuts

  /**
   * Fetch the value of the resource.
   * @param options OData options.
   * @returns Observable of the value.
   */
  fetch(options?: ODataOptions): Observable<T> {
    return this.get(options);
  }

  //#endregion
}
