import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ODataResource } from '../resource';
import { ODataPathSegments } from '../path-segments';
import { HttpOptions } from './options';
import { ODataMetadata } from '../responses';
import { $METADATA } from '../../constants';
import { ODataApi } from '../../api';
import { PathSegmentNames } from '../../types';

export class ODataMetadataResource extends ODataResource<any> {
  constructor(api: ODataApi, segments?: ODataPathSegments) {
    super(api, segments);
  }

  clone() {
    return new ODataMetadataResource(this.api, this.cloneSegments());
  }

  schema() {
    return undefined;
  }
  //#region Factory
  static factory(api: ODataApi) {
    let segments = new ODataPathSegments();
    segments.add(PathSegmentNames.metadata, $METADATA);
    return new ODataMetadataResource(api, segments);
  }
  //#endregion

  //#region Requests
  get(options?: HttpOptions): Observable<ODataMetadata> {
    return super
      .get({ responseType: 'text', ...options })
      .pipe(map((body: any) => new ODataMetadata(body)));
  }
  //#endregion

  //#region Shortcuts
  fetch(options?: HttpOptions): Observable<ODataMetadata> {
    return this.get(options);
  }
  //#endregion
}
