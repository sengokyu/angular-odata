import { NEVER, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import {
  ODataEntityResource,
  ODataPropertyResource,
  ODataNavigationPropertyResource,
  HttpOptions,
  HttpEntityOptions,
  ODataEntityMeta,
  ODataEntitiesMeta,
  ODataEntity,
  ODataSingletonResource,
  ODataFunctionResource,
  ODataActionResource,
  ODataEntities,
  ODataProperty,
  HttpEntitiesOptions,
} from '../resources/index';

import { ODataCollection } from './collection';
import { ODataStructuredTypeFieldParser } from '../parsers/structured-type';
import { Types } from '../utils/types';
import { Objects } from '../utils';
import { EventEmitter, Type } from '@angular/core';
import { ODataStructuredType } from '../schema';

export type ODataModelResource<T> = ODataEntityResource<T> | ODataSingletonResource<T> | ODataNavigationPropertyResource<T> | ODataPropertyResource<T>;

export class ODataModel<T> {
  private __entity: T = {} as T;
  private __resource?: ODataModelResource<T>;
  private __schema?: ODataStructuredType<T>;
  private __meta: ODataEntityMeta;
  private __relations: {
    [name: string]: {
      model: ODataModel<any> | ODataCollection<any, ODataModel<any>> | null,
      field: ODataStructuredTypeFieldParser<any>,
      subscriptions: Subscription[]
    }
  } = {};
  //Events
  change$ = new EventEmitter<{ attribute: string, value: any, previous?: any }>();
  request$ = new EventEmitter<Observable<ODataEntity<T>>>();
  sync$ = new EventEmitter();
  destroy$ = new EventEmitter();
  invalid$ = new EventEmitter<{ [name: string]: string[] }>();

  constructor(data?: any, options: {
    resource?: ODataModelResource<T>,
    schema?: ODataStructuredType<T>,
    meta?: ODataEntityMeta
  } = {}) {
    data = data || {};
    if (options.schema)
      this.bind(options.schema);
    if (options.resource)
      this.attach(options.resource);
    this.__meta = options.meta || new ODataEntityMeta(data, { options: options.resource?.api.options });
    data = this.__meta.attributes<T>(data);
    this.assign(Objects.merge(this.defaults(), data));
  }

  bind(schema: ODataStructuredType<T>) {
    if (this.__schema !== schema) {
      this.__schema = schema;

      // Bind Properties
      schema.fields({ include_navigation: true, include_parents: true })
        .forEach(field => {
          Object.defineProperty(this, field.name, {
            configurable: true,
            get() {
              return this.__get(field);
            },
            set(model: any) {
              this.__set(field, model);
            }
          });
        });
    }
  }

  attach(resource: ODataModelResource<T>) {
    if (this.__resource !== undefined && this.__resource.type() !== resource.type() && !resource.isSubtypeOf(this.__resource))
      throw new Error(`Can't reattach ${resource.type()} to ${this.__resource.type()}`);
    this.__resource = resource;

    const schema = this.__resource.schema;
    if (schema !== undefined)
      this.bind(schema);

    // Attach complex
    Object.values(this.__relations).forEach(({ field, model }) => {
      if (model !== null) {
        const resource = this.__resource !== undefined ? this.__resource.property<any>(field.name) : undefined;
        if (resource !== undefined)
          model.attach(resource);
      }
    });
    return this;
  }

  _resource() {
    return this.__resource?.clone();
  }

  // Validation
  _errors?: { [name: string]: string[] } | null;
  protected validate() {
    const errors = {} as { [name: string]: string[] };
    const fields = this._schema()?.fields({ include_navigation: false, include_parents: true }) || [];
    // Nullables
    fields.forEach(f => {
      let value = (this as any)[f.name] as any;
      if (f.nullable === false && value == null) {
        (errors[f.name] || (errors[f.name] = [])).push(`required`);
      }
      if (f.maxLength !== undefined && typeof value === 'string' && value.length > f.maxLength) {
        (errors[f.name] || (errors[f.name] = [])).push(`maxlength`);
      }
      if (f.isComplexType() && value instanceof ODataModel && !value.isValid()) {
        Object.entries(value._errors as { [name: string]: string[] }).forEach(([key, value]) => {
          errors[`${f.name}.${key}`] = value;
        });
      }
    });
    return !Types.isEmpty(errors) ? errors : null;
  }

  isValid(): boolean {
    let error = this._errors = this.validate();
    if (error)
      this.invalid$.emit(error);
    return this._errors === null;
  }

  _key() {
    return this.__schema?.resolveKey(this.toEntity());
  }

  isNew() {
    return this._key() === undefined;
  }

  protected defaults() {
    return this._schema()?.defaults() || {};
  }

  protected parse(attrs: Object): T {
    return attrs as T;
  }

  toEntity(): T {
    return Object.entries(
      Object.assign({},
        this.__entity,
        Object.entries(this.__relations)
          .filter(([, v]) => !v.field.isNavigation())
          .reduce((acc, [k, v]) => Object.assign(acc, { [k]: v.model }), {})
      )
    ).reduce((acc, [k, value]) =>
      Object.assign(acc, {
        [k]: (value instanceof ODataModel) ?
          value.toEntity() :
          (value instanceof ODataCollection) ?
            value.toEntities() : value
      }),
      {}) as T;
  }

  assign(data: any) {
    const attrs = this.parse(data) || {};
    const assign = (target: any, source: { [attr: string]: any }) => {
      for (let attr in source) {
        let current = target[attr];
        let value = source[attr];
        if (value !== null && Types.isObject(value) && (current instanceof ODataModel || current instanceof ODataCollection)) {
          current.assign(value);
        } else if (current !== value) {
          target[attr] = value;
        }
      }
    };
    assign(this, attrs);
    return this;
  }

  clone() {
    let options: { resource?: ODataModelResource<T>, meta?: ODataEntityMeta } = {};
    if (this.__resource)
      options.resource = this.__resource.clone();
    if (this.__meta)
      options.meta = this.__meta.clone();
    let Ctor = <typeof ODataModel>this.constructor;
    return new Ctor(this.toEntity(), options);
  }

  private __request(obs$: Observable<ODataEntity<any>>): Observable<this> {
    this.request$.emit(obs$);
    return obs$.pipe(
      map(({ entity, meta }) => {
        this.__meta = meta;
        if (meta.type !== this.__resource?.type && meta.type !== undefined) {
          const resource = this._resource() as ODataEntityResource<T>;
          resource.segment.entitySet().type(meta.type);
          this.attach(resource);
        }
        this.assign(this.__meta.attributes<T>(entity || {}));
        this.sync$.emit();
        return this;
      }));
  }

  fetch(options?: HttpOptions): Observable<this> {
    let obs$: Observable<ODataEntity<any>> = NEVER;
    if (this.__resource instanceof ODataEntityResource) {
      if (!this.__resource.segment.entitySet().hasKey())
        throw new Error(`Can't fetch entity without key`);
      obs$ = this.__resource.get(options);
    } else if (this.__resource instanceof ODataNavigationPropertyResource) {
      obs$ = this.__resource.get(
        Object.assign<HttpEntityOptions, HttpOptions>(<HttpEntityOptions>{ responseType: 'entity' }, options || {}));
    } else if (this.__resource instanceof ODataPropertyResource) {
      obs$ = this.__resource.get(
        Object.assign<HttpEntityOptions, HttpOptions>(<HttpEntityOptions>{ responseType: 'entity' }, options || {}));
    }
    return this.__request(obs$);
  }

  create(options?: HttpOptions): Observable<this> {
    let obs$: Observable<ODataEntity<any>> = NEVER;
    if (this.__resource instanceof ODataEntityResource) {
      const attrs = this.toEntity();
      obs$ = this.__resource.post(attrs, options).pipe(
        map(({ entity, meta }) => ({ entity: entity || attrs, meta })));
    }
    return this.__request(obs$);
  }

  update(options?: HttpOptions): Observable<this> {
    let obs$: Observable<ODataEntity<any>> = NEVER;
    if (this.__resource instanceof ODataEntityResource) {
      if (!this.__resource.segment.entitySet().hasKey())
        throw new Error(`Can't update entity without key`);
      const attrs = this.toEntity() as any;
      obs$ = this.__resource.post(attrs, options).pipe(
        map(({ entity, meta }) => ({ entity: entity || attrs, meta })));
      /*
      obs$ = Object.values(this.__navigation)
        .reduce((acc, value) => {
          let ref = (this.__resource as ODataEntityResource<T>).navigationProperty<any>(value.field.name).reference();
          delete attrs[value.field.name];
          return acc.pipe(switchMap(({meta}) => value.model != null ?
            ref.set(value.model._resource() as ODataEntityResource<any>, {etag: meta.etag}) :
            ref.unset({etag: meta.etag})));
        }, of({meta: this.__meta as ODataEntityMeta}))
        .pipe(
          switchMap(({meta}) => resource.put(attrs, Object.assign({ etag: meta.etag }, options || {}))),
          map(({entity, meta}) => ({entity: entity || attrs, meta})));
        */
    }
    return this.__request(obs$);
  }

  save(options?: HttpOptions): Observable<this> {
    return this.isNew() ? this.create(options) : this.update(options);
  }

  destroy(options?: HttpOptions): Observable<this> {
    let obs$: Observable<ODataEntity<any>> = NEVER;
    if (this.__resource instanceof ODataEntityResource) {
      if (!this.__resource.segment.entitySet().hasKey())
        throw new Error(`Can't destroy entity without key`);
      const attrs = this.toEntity() as any;
      obs$ = this.__resource.delete(Object.assign({ etag: this.__meta.etag }, options || {})).pipe(
        map(({ entity, meta }) => ({ entity: entity || attrs, meta })));
    }
    return this.__request(obs$).pipe(tap(() => this.destroy$.emit()));
  }

  protected _schema(): ODataStructuredType<T> | undefined {
    return this.__schema ? this.__schema : undefined;
  }

  // Cast
  protected _cast<S extends T>(type: string) {
    //if (this.__resource instanceof ODataEntityResource || this.__resource instanceof ODataNavigationPropertyResource) {
    if (this.__resource instanceof ODataEntityResource)
      return this.__resource.cast<S>(type);
    throw new Error(`Can't cast without ODataEntityResource or ODataNavigationPropertyResource`);
  }

  // Function
  protected _function<P, R>(name: string) {
    if (this.__resource instanceof ODataEntityResource)
      return this.__resource.function<P, R>(name);
    throw new Error(`Can't function without ODataEntityResource`);
  }

  // Action
  protected _action<P, R>(name: string) {
    if (this.__resource instanceof ODataEntityResource)
      return this.__resource.action<P, R>(name);
    throw new Error(`Can't action without ODataEntityResource`);
  }

  // Navigation
  protected _navigationProperty<P>(name: string) {
    if (this.__resource instanceof ODataEntityResource || this.__resource instanceof ODataNavigationPropertyResource) {
      return this.__resource.navigationProperty<P>(name);
    }
    throw new Error(`Can't navigationProperty without ODataEntityResource or ODataNavigationPropertyResource`);
  }

  // Property
  protected _property<P>(name: string) {
    if (this.__resource instanceof ODataEntityResource || this.__resource instanceof ODataNavigationPropertyResource || this.__resource instanceof ODataPropertyResource) {
      return this.__resource.property<P>(name);
    }
    throw new Error(`Can't navigationProperty without ODataEntityResource or ODataNavigationPropertyResource or ODataPropertyResource`);
  }

  protected _setReference<P>(
    name: string,
    model: ODataModel<P> | null,
    options?: HttpOptions): Observable<this> {
    const field = this._schema()?.findField(f => f.name === name);
    if (field === undefined)
      throw new Error(`Can't find field ${name}`);
    if (field.collection)
      throw new Error(`Can't set ${field.name} to collection, use add`);
    // TODO: check and
    /*
        if (field.field) {
          current = this.__entity[field.field as keyof T] as any;
          value = model?._key() as P || null;
          (this.__entity as any)[field.field] = value;
        }
    */
    let resource = this._navigationProperty<P>(field.name).reference();
    let etag = this.__meta.etag;
    let opts = Object.assign({ etag }, options || {});
    if (model instanceof ODataModel)
      return resource.set(model._resource() as ODataEntityResource<P>, opts)
        .pipe(map(() => this));
    else if (model === null)
      return resource.unset(opts)
        .pipe(map(() => this));
    return of(this);
  }

  private __model<P>(
    field: ODataStructuredTypeFieldParser<P>,
    value: any,
    resource?: ODataPropertyResource<P> | ODataNavigationPropertyResource<P>
  ): ODataModel<P> | ODataCollection<P, ODataModel<P>> {
    const schema = this.__schema?.api.findStructuredTypeForType(field.type);
    const Model = schema?.model || ODataModel;
    const Collection = schema?.collection || ODataCollection;
    const data = field.collection ? (value || []) as T[] : (value || {}) as T;
    const meta = field.collection ?  new ODataEntitiesMeta(this.__meta.property(field.name) || {}, {options: this.__meta.options}) :
      new ODataEntityMeta(value || {}, {options: this.__meta.options});
    return field.collection ?
        new Collection(data, {resource, schema, meta}) :
        new Model(data, {resource, schema, meta});
  }

  private __get<P>(field: ODataStructuredTypeFieldParser<P>): P | ODataModel<P> | ODataCollection<P, ODataModel<P>> | null {
    const value = this.__entity[field.name as keyof T] as any;
    if (value !== null) {
      if (field.isComplexType() || field.isNavigation()) {
        if (field.isNavigation() && this.isNew())
          throw new Error(`Can't get ${field.name} from unsaved model`);
        if (!(field.name in this.__relations)) {
          const resource = field.isNavigation() ? this._navigationProperty<P>(field.name) : this._property<P>(field.name);
          const model = this.__model(field, value, resource);
          this.__relations[field.name] = { field, model, subscriptions: this.__subscribe<P>(field, model) };
        }
        return this.__relations[field.name].model;
      }
    }
    return value;
  }

  private __set<P>(field: ODataStructuredTypeFieldParser<P>, value: P | ODataModel<P> | ODataCollection<P, ODataModel<P>> | null) {
    let current: any;
    if (field.isComplexType() || field.isNavigation()) {
      let model: ODataModel<P> | ODataCollection<P, ODataModel<P>> | null;
      if (field.isNavigation()) {
        if (this.isNew())
          throw new Error(`Can't set ${field.name} from unsaved model`);
        if (field.collection)
          throw new Error(`Can't set ${field.name} to navigation collection, use add instead`);
        model = value as ODataModel<P> | null;
        if (model?.isNew())
          throw new Error(`Can't set ${field.name}`);
      } else {
        model = value as ODataModel<P> | ODataCollection<P, ODataModel<P>> | null;
      }
      const relation = this.__relations[field.name];
      if (relation !== undefined) {
        relation.subscriptions.forEach(sub => sub.unsubscribe());
      }
      current = relation?.model as ODataModel<any> | ODataCollection<any, ODataModel<any>> | null;
      if (model !== null) {
        const resource = field.isNavigation() ? this._navigationProperty<P>(field.name) : this._property<P>(field.name);
        if (!(model instanceof ODataModel) && !(model instanceof ODataCollection)) {
          model = this.__model(field, value, resource);
        } else if (resource !== undefined)
          model.attach(resource);
        const type = model._resource()?.type();
        if (type !== field.type)
          throw new Error(`Can't set ${type} to ${field.type}`);
      }
      this.__relations[field.name] = { model, field, subscriptions: model !== null ? this.__subscribe(field, model) : [] };
      this.change$.emit({ value: model, attribute: field.name, previous: current });
    } else {
      current = this.__entity[field.name as keyof T] as any;
      this.__entity[field.name as keyof T] = value as any;
      if (!Types.isEqual(current, value)) {
        if (field.key) {
          const key = this._key();
          const resource = this._resource();
          if (key !== undefined && resource !== undefined && !(resource instanceof ODataSingletonResource)) {
            resource.segment.entitySet().key(key);
            this.attach(resource);
          }
        }
        this.change$.emit({ value, attribute: field.name, previous: current });
      }
    }
  }

  private __subscribe<E>(field: ODataStructuredTypeFieldParser<E>, value: ODataModel<E> | ODataCollection<E, ODataModel<E>>) {
    const subs = [];
    if (value instanceof ODataModel) {
      //Changes
      subs.push(value.change$.subscribe((event: any) => this.change$.emit({
        value: event.value,
        previous: event.previous,
        attribute: `${field.name}.${event.attribute}`
      })
      ));
    }
    return subs;
  }
}
