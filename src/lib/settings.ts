import { HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { ODataModel, ODataModelCollection } from './models';
import { InjectionToken } from '@angular/core';
import { Schema, Field } from './schema';

export const ODATA_CONFIG = new InjectionToken<ODataConfig>('odata.config');

export interface ODataConfig {
  baseUrl: string,
  metadataUrl?: string,
  withCredentials?: boolean,
  stringAsEnum?: boolean,
  creation?: Date,
  version?: string,
  enums?: {[type: string]: {[key: number]: string | number}},
  schemas?: {[type: string]: {[name: string]: Field }},
  models?: {[type: string]: { new(...any): ODataModel} };
  collections?:{[type: string]: { new(...any): ODataModelCollection<ODataModel> } };
  errorHandler?: (error: HttpErrorResponse) => Observable<never>
}

export class ODataSettings {
  baseUrl: string;
  metadataUrl?: string;
  withCredentials?: boolean;
  stringAsEnum?: boolean;
  creation?: Date;
  version?: string;
  enums?: {[type: string]: {[key: number]: string | number}};
  schemas?: {[type: string]: Schema<any> };
  models?: {[type: string]: { new(...any): ODataModel} };
  collections?:{[type: string]: { new(...any): ODataModelCollection<ODataModel> } };
  errorHandler?: (error: HttpErrorResponse) => Observable<never>;

  constructor(config: ODataConfig) {
    this.baseUrl = config.baseUrl;
    this.metadataUrl = config.metadataUrl || `${config.baseUrl}$metadata`;
    this.withCredentials = config.withCredentials || false;
    this.stringAsEnum = config.stringAsEnum || false;
    this.creation = config.creation || new Date();
    this.errorHandler = config.errorHandler || null;

    this.enums = config.enums || {};
    this.models = config.models || {};
    this.collections = config.collections || {};

    // Build schemas
    this.schemas = Object.entries(config.schemas || {})
      .reduce((acc, [type, config]) => Object.assign(acc, {[type]: new Schema(config)}), {});

    // Configure
    Object.entries(this.schemas)
      .forEach(([type, schema]) => schema.configure(type, this));
  }

  public schemaForType<E>(type: string): Schema<E> {
    if (type in this.schemas)
      return this.schemas[type] as Schema<E>;
  }

  public modelForType(type: string): typeof ODataModel {
    if (type in this.models)
      return this.models[type] as typeof ODataModel;
  }

  public collectionForType(type: string): typeof ODataModelCollection {
    if (type in this.collections)
      return this.collections[type] as typeof ODataModelCollection;
  }

}