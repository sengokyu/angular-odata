import { map } from 'rxjs/operators';
import { Observable, of, NEVER } from 'rxjs';

import { ODataEntitySetResource, Filter, Expand, GroupBy, Select, OrderBy, ODataEntityResource, ODataNavigationPropertyResource, ODataPropertyResource, ODataEntityAnnotations, ODataPropertyAnnotations, ODataRelatedAnnotations, ODataCollectionAnnotations, ODataFunctionResource, ODataActionResource, ODataResource, ODataAnnotations, ODataToEntityResource } from '../resources';

import { ODataModel } from './model';
import { HttpOptions, HttpEntitiesOptions } from '../resources/http-options';
import { entityAttributes, odataAnnotations } from '../types';
import { ODataCallableResource } from '../resources/requests/callable';

export class ODataCollection<T, M extends ODataModel<T>> implements Iterable<M> {
  _resource: ODataResource<T>;
  _entities: T[];
  _models: M[];
  _annotations: ODataAnnotations | null;
  _state: {
    records?: number,
    size?: number,
    page?: number,
    pages?: number
  } = {};

  constructor(resource: ODataResource<T>, entities?: Partial<T>[], annots?: ODataAnnotations) {
    this._resource = resource;
    this.populate((entities || []) as T[], annots || null);
  }

  attach(resource: ODataResource<T>) {
    if (this._resource && this._resource.type() !== resource.type())
      throw new Error(`Can't reattach ${resource.type()} with ${this._resource.type()}`);
    this._resource = resource;
    return this;
  }

  private populate(entities: T[], annots?: ODataAnnotations): this {
    this._entities = entities;
    this._annotations = annots;

    this._state.records = (annots instanceof ODataCollectionAnnotations && annots.count) ? annots.count : entities.length;
    this._state.size = (annots instanceof ODataCollectionAnnotations && annots.skip) ? annots.skip : entities.length;
    this._state.pages = (this._state.records && this._state.size) ? Math.ceil(this._state.records / this._state.size) : 1;
    const entityMapper = (value) => {
      let entity = entityAttributes(value);
      let eannots = ODataEntityAnnotations.factory(odataAnnotations(value));
      if ("entity" in this._resource) {
        let res = this._resource as ODataToEntityResource<T>;
        return res.entity(value, annots).toModel(entity, eannots) as M;
      }
    }
    this._models = entities.map(entityMapper);
    return this;
  }

  toEntities() {
    return this._models.map(model => model.toEntity());
  }

  clone() {
    let Ctor = <typeof ODataCollection>this.constructor;
    return (new Ctor(this._resource.clone(), this.toEntities(), this._annotations)) as ODataCollection<T, ODataModel<T>>;
  }

  // Iterable
  public [Symbol.iterator]() {
    let pointer = 0;
    let models = this._models;
    return {
      next(): IteratorResult<M> {
        return {
          done: pointer === models.length,
          value: models[pointer++]
        };
      }
    }
  }

  // Requests
  fetch(options?: HttpOptions): Observable<this> {
    let opts = <HttpEntitiesOptions>{
      headers: options && options.headers,
      params: options && options.params,
      reportProgress: options && options.reportProgress,
      withCredentials: options && options.withCredentials
    }
    let obs$: Observable<any>;
    if (!this._state.page)
      this._state.page = 1;
    if (this._resource instanceof ODataEntitySetResource) {
      if (this._state.size) {
        this._resource.top(this._state.size);
        this._resource.skip(this._state.size * (this._state.page - 1));
      }
      obs$ = this._resource.get(Object.assign(opts, { withCount: true }));
    } else if (this._resource instanceof ODataNavigationPropertyResource) {
      if (this._state.size) {
        this._resource.top(this._state.size);
        this._resource.skip(this._state.size * (this._state.page - 1));
      }
      obs$ = this._resource.get(Object.assign(opts, { withCount: true, responseType: 'entities' }));
    } else if (this._resource instanceof ODataFunctionResource) {
      obs$ = this._resource.get(Object.assign(opts, { responseType: 'entities' }));
    }
    if (!obs$)
      throw new Error("Not Yet!");
    return obs$.pipe(
      map(([entities, annots]) => this.populate(entities, annots)));
  }

  all(): Observable<this> {
    let obs$: Observable<any>;
    if (!this._state.page)
      this._state.page = 1;
    if (this._resource instanceof ODataEntitySetResource) {
      obs$ = this._resource.all();
    } else if (this._resource instanceof ODataNavigationPropertyResource) {
      obs$ = this._resource.all();
    }
    if (!obs$)
      throw new Error("Not Yet!");
    return obs$.pipe(
      map(entities => this.populate(entities)));
  }

  // Mutate
  add(model: M): Observable<this> {
    let obs$: Observable<any>;
    if (this._resource instanceof ODataEntitySetResource) {
      obs$ = model.save();
    } else if (this._resource instanceof ODataNavigationPropertyResource) {
      let ref = this._resource.reference();
      obs$ = ref.add(model._resource as ODataEntityResource<T>);
    }
    if (!obs$)
      throw new Error("Not Yet!");
    return obs$.pipe(map(() => this));
  }

  remove(model: M) {
    let obs$: Observable<any>;
    if (this._resource instanceof ODataEntitySetResource) {
      obs$ = model.destroy();
    } else if (this._resource instanceof ODataNavigationPropertyResource) {
      let ref = this._resource.reference();
      obs$ = ref.remove({ target: model._resource as ODataEntityResource<T> });
    }
    if (!obs$)
      throw new Error("Not Yet!");
    return obs$.pipe(map(() => this));
  }

  // Pagination
  page(page: number) {
    this._state.page = page;
    return this.fetch();
  }

  size(size: number) {
    this._state.size = size;
    return this.page(1);
  }

  firstPage() {
    return this.page(1);
  }

  previousPage() {
    return (this._state.page) ? this.page(this._state.page - 1) : this.fetch();
  }

  nextPage() {
    return (this._state.page) ? this.page(this._state.page + 1) : this.fetch();
  }

  lastPage() {
    return (this._state.pages) ? this.page(this._state.pages) : this.fetch();
  }

  // Count
  count() {
    return (this._resource as ODataEntitySetResource<any>).count().get();
  }

  // Callable
  protected call<R>(
    callable: ODataCallableResource<R>, 
    args: any | null, 
    responseType: 'value', 
    options?: HttpOptions
  ): Observable<R>;

  protected call<R, M extends ODataModel<R>>(
    callable: ODataCallableResource<R>, 
    args: any | null, 
    responseType: 'model', 
    options?: HttpOptions
  ): Observable<M>;

  protected call<R, M extends ODataModel<R>, C extends ODataCollection<R, M>>(
    callable: ODataCallableResource<R>, 
    args: any | null, 
    responseType: 'collection', 
    options?: HttpOptions
  ): Observable<C>;

  protected call(
    callable: ODataCallableResource<any>, 
    args: any | null, 
    responseType: 'value' | 'model' | 'collection', 
    options?: HttpOptions
  ): Observable<any> {
    let ops = <any>{
      headers: options && options.headers,
      params: options && options.params,
      responseType: responseType === 'value' ? 'property' : 
        responseType === 'model' ? 'entity' : 'entities',
      reportProgress: options && options.reportProgress,
      withCredentials: options && options.withCredentials,
      withCount: responseType === 'collection' 
    }
    let res$: Observable<any> = NEVER;
    if (callable instanceof ODataFunctionResource) {
      if (args)
        callable.parameters(args);
      res$ = callable.get(ops) as Observable<any>;
    } else if (callable instanceof ODataActionResource) {
      res$ = callable.post(args, ops) as Observable<any>;
    } else {
      throw new Error(`Can't call resource`);
    }
    switch (responseType) {
      case 'value':
        return (res$ as Observable<[any, ODataPropertyAnnotations]>).pipe(map(([value, ]) => value));
      case 'model':
        return (res$ as Observable<[any, ODataEntityAnnotations]>).pipe(map(([entity, annots]) => callable.toModel<ODataModel<any>>(entity, annots)));
      case 'collection':
        return (res$ as Observable<[any[], ODataCollectionAnnotations]>).pipe(map(([entities, annots]) => callable.toCollection<ODataCollection<any, ODataModel<any>>>(entities, annots)));
    }
  }

  // Functions
  protected function<R>(name: string, returnType?: string): ODataFunctionResource<R> {
    if (this._resource instanceof ODataEntitySetResource) {
      return this._resource.function<R>(name, returnType);
    }
    throw new Error(`Can't function without EntitySetResource`);
  }

  // Actions
  protected action<R>(name: string, returnType?: string): ODataActionResource<R> {
    if (this._resource instanceof ODataEntitySetResource) {
      return this._resource.action<R>(name, returnType);
    }
    throw new Error(`Can't action without EntitySetResource`);
  }

  // Array like
  filter(predicate: (m: M) => boolean): M[] {
    return this._models.filter(predicate);
  }

  map(predicate: (m: M) => any) {
    return this._models.map(predicate);
  }

  at(index: number): M {
    return this._models[index >= 0 ? index : this._models.length - index];
  }

  // Query options
  get query() {
    let resource = this._resource as ODataEntitySetResource<T>;
    return {
      select(select?: Select<T>) { return resource.select(select); },
      filter(filter?: Filter) { return resource.filter(filter); },
      search(search?: string) { return resource.search(search); },
      orderBy(orderBy?: OrderBy<T>) { return resource.orderBy(orderBy); },
      expand(expand?: Expand<T>) { return resource.expand(expand); },
      groupBy(groupBy?: GroupBy<T>) { return resource.groupBy(groupBy); },
    }
  }
}
