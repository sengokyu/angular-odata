import { PathSegmentNames, QueryOptionNames } from '../../types';

import { $COUNT } from '../../constants';
import { ODataApi } from '../../api';
import { ODataOptions } from './options';
import { ODataPathSegments, ODataPathSegmentsHandler } from '../path';
import { ODataQueryOptions, Filter, ODataQueryOptionsHandler } from '../query';
import { ODataResource } from '../resource';
import { Observable } from 'rxjs';

export class ODataCountResource<T> extends ODataResource<T> {
  //#region Factory
  static factory<T>(
    api: ODataApi,
    segments: ODataPathSegments,
    query: ODataQueryOptions
  ) {
    segments.add(PathSegmentNames.count, $COUNT).type('Edm.Int32');
    query.keep(QueryOptionNames.filter, QueryOptionNames.search);
    return new ODataCountResource<T>(api, segments, query);
  }
  //#endregion

  clone() {
    return new ODataCountResource<T>(
      this.api,
      this.cloneSegments(),
      this.cloneQuery()
    );
  }
  schema() {
    return undefined;
  }

  segment(func: (q: ODataPathSegmentsHandler<T>) => void) {
    func(this.pathSegmentsHandler());
    return this;
  }

  query(func: (q: ODataQueryOptionsHandler<T>) => void) {
    func(this.queryOptionsHandler());
    return this;
  }

  //#region Requests
  protected get(options?: ODataOptions): Observable<number> {
    return super.get({ responseType: 'value', ...options });
  }
  //#endregion

  //#region Shortcuts
  /**
   * Fetch the count of the set.
   * @param options Options for the request
   * @returns The count of the set
   */
  fetch(options?: ODataOptions): Observable<number> {
    return this.get(options);
  }
  //#endregion
}
