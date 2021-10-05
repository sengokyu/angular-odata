import { EMPTY, Observable } from 'rxjs';
import { concatMap, expand, map, toArray } from 'rxjs/operators';

import { ODataValueResource } from './value';

import { EntityKey, ODataResource } from '../resource';
import { ODataQueryOptions } from '../query-options';
import { ODataPathSegments } from '../path-segments';
import {
  ODataPropertyOptions,
  ODataEntitiesOptions,
  ODataEntityOptions,
  ODataOptions,
} from './options';
import {
  ODataProperty,
  ODataEntities,
  ODataEntity,
  ODataEntityAnnotations,
  ODataEntitiesAnnotations,
} from '../responses';
import { ODataStructuredTypeParser } from '../../parsers/structured-type';
import { ODataModel, ODataCollection } from '../../models';
import { ODataApi } from '../../api';
import { Expand, Filter, OrderBy, Select, Transform } from '../builder';
//import { ODataNavigationPropertyResource } from './navigation-property';
import { PathSegmentNames } from '../../types';

export class ODataPropertyResource<T> extends ODataResource<T> {
  //#region Factory
  static factory<P>(
    api: ODataApi,
    path: string,
    type: string | undefined,
    segments: ODataPathSegments,
    options: ODataQueryOptions
  ) {
    const segment = segments.add(PathSegmentNames.property, path);
    if (type) segment.type(type);
    options.clear();
    return new ODataPropertyResource<P>(api, segments, options);
  }
  //#endregion

  clone() {
    return new ODataPropertyResource<T>(
      this.api,
      this.cloneSegments(),
      this.cloneQuery()
    );
  }

  schema() {
    let type = this.type();
    return type !== undefined
      ? this.api.findStructuredTypeForType<T>(type)
      : undefined;
  }

  asModel<M extends ODataModel<T>>(
    entity: Partial<T> | { [name: string]: any },
    { annots, reset }: { annots?: ODataEntityAnnotations; reset?: boolean } = {}
  ): M {
    const type = annots?.type || this.type();
    const Model = this.api.modelForType(type);
    return new Model(entity, { resource: this, annots, reset }) as M;
  }

  asCollection<M extends ODataModel<T>, C extends ODataCollection<T, M>>(
    entities: Partial<T>[] | { [name: string]: any }[],
    {
      annots,
      reset,
    }: { annots?: ODataEntitiesAnnotations; reset?: boolean } = {}
  ): C {
    const type = annots?.type || this.type();
    const Collection = this.api.collectionForType(type);
    return new Collection(entities, { resource: this, annots, reset }) as C;
  }

  //#region Inmutable Resource
  key(value: any) {
    const property = this.clone();
    var key = this.resolveKey(value);
    if (key !== undefined) property.segment.property().key(key);
    return property;
  }

  keys(values: any[]) {
    const property = this.clone();
    const types = this.pathSegments.types({ key: true });
    const keys = values.map((value, index) =>
      ODataResource.resolveKey(
        value,
        this.api.findStructuredTypeForType<T>(types[index])
      )
    );
    property.segment.keys(keys);
    return property;
  }

  value() {
    return ODataValueResource.factory<T>(
      this.api,
      this.type(),
      this.cloneSegments(),
      this.cloneQuery()
    );
  }
  /*
  navigationProperty<N>(path: string) {
    let type = this.type();
    if (type !== undefined) {
      let parser = this.api.parserForType<N>(type);
      type =
        parser instanceof ODataStructuredTypeParser
          ? parser.typeFor(path)
          : undefined;
    }
    return ODataNavigationPropertyResource.factory<N>(
      this.api,
      path,
      type,
      this.cloneSegments(),
      this.cloneQuery()
    );
  }
  */
  property<P>(path: string) {
    let type = this.type();
    if (type !== undefined) {
      let parser = this.api.parserForType<P>(type);
      type =
        parser instanceof ODataStructuredTypeParser
          ? parser.typeFor(path)
          : undefined;
    }
    return ODataPropertyResource.factory<P>(
      this.api,
      path,
      type,
      this.cloneSegments(),
      this.cloneQuery()
    );
  }

  select(opts: Select<T>) {
    const clone = this.clone();
    clone.query.select(opts);
    return clone;
  }

  expand(opts: Expand<T>) {
    const clone = this.clone();
    clone.query.expand(opts);
    return clone;
  }

  transform(opts: Transform<T>) {
    const clone = this.clone();
    clone.query.transform(opts);
    return clone;
  }

  search(opts: string) {
    const clone = this.clone();
    clone.query.search(opts);
    return clone;
  }

  filter(opts: Filter) {
    const clone = this.clone();
    clone.query.filter(opts);
    return clone;
  }

  orderBy(opts: OrderBy<T>) {
    const clone = this.clone();
    clone.query.orderBy(opts);
    return clone;
  }

  format(opts: string) {
    const clone = this.clone();
    clone.query.format(opts);
    return clone;
  }

  top(opts: number) {
    const clone = this.clone();
    clone.query.top(opts);
    return clone;
  }

  skip(opts: number) {
    const clone = this.clone();
    clone.query.skip(opts);
    return clone;
  }

  skiptoken(opts: string) {
    const clone = this.clone();
    clone.query.skiptoken(opts);
    return clone;
  }
  //#endregion

  //#region Mutable Resource
  get segment() {
    const segments = this.pathSegments;
    return {
      entitySet() {
        return segments.get(PathSegmentNames.entitySet);
      },
      singleton() {
        return segments.get(PathSegmentNames.singleton);
      },
      property() {
        return segments.get(PathSegmentNames.property);
      },
      keys(values?: (EntityKey<any> | undefined)[]) {
        return segments.keys(values);
      },
    };
  }

  get query() {
    return this.entitiesQueryHandler();
  }
  //#endregion

  //#region Requests
  protected get(
    options: ODataEntityOptions & ODataEntitiesOptions & ODataPropertyOptions
  ): Observable<any> {
    return super.get(options);
  }
  //#endregion

  //#region Shortcuts
  fetch(
    options?: ODataEntityOptions & { etag?: string }
  ): Observable<ODataEntity<T>>;
  fetch(options?: ODataEntitiesOptions): Observable<ODataEntities<T>>;
  fetch(options?: ODataPropertyOptions): Observable<ODataProperty<T>>;
  fetch(
    options: ODataEntityOptions &
      ODataEntitiesOptions &
      ODataPropertyOptions & { etag?: string } = {}
  ): Observable<any> {
    return this.get(options);
  }

  fetchProperty(
    options: ODataOptions & { etag?: string } = {}
  ): Observable<T | null> {
    return this.fetch({ responseType: 'property', ...options }).pipe(
      map(({ property }) => property)
    );
  }

  fetchEntity(
    options: ODataOptions & { etag?: string } = {}
  ): Observable<T | null> {
    return this.fetch({ responseType: 'entity', ...options }).pipe(
      map(({ entity }) => entity)
    );
  }

  fetchModel<M extends ODataModel<T>>(
    options: ODataOptions & { etag?: string } = {}
  ): Observable<M | null> {
    return this.fetch({ responseType: 'entity', ...options }).pipe(
      map(({ entity, annots }) =>
        entity ? this.asModel<M>(entity, { annots, reset: true }) : null
      )
    );
  }

  fetchEntities(
    options: ODataOptions & { withCount?: boolean } = {}
  ): Observable<T[] | null> {
    return this.fetch({ responseType: 'entities', ...options }).pipe(
      map(({ entities }) => entities)
    );
  }

  fetchCollection<M extends ODataModel<T>, C extends ODataCollection<T, M>>(
    options: ODataOptions & { withCount?: boolean } = {}
  ): Observable<C | null> {
    return this.fetch({ responseType: 'entities', ...options }).pipe(
      map(({ entities, annots }) =>
        entities
          ? this.asCollection<M, C>(entities, { annots, reset: true })
          : null
      )
    );
  }

  fetchAll(options: ODataOptions = {}): Observable<T[]> {
    let res = this.clone();
    // Clean Paging
    res.query.clearPaging();
    let fetch = (opts?: {
      skip?: number;
      skiptoken?: string;
      top?: number;
    }): Observable<ODataEntities<T>> => {
      if (opts) {
        res.query.paging(opts);
      }
      return res.fetch({ responseType: 'entities', ...options });
    };
    return fetch().pipe(
      expand(({ annots: meta }) =>
        meta.skip || meta.skiptoken ? fetch(meta) : EMPTY
      ),
      concatMap(({ entities }) => entities || []),
      toArray()
    );
  }
  //#endregion
}
