import { raw, buildPathAndQuery } from '../query';

import { Types, Dates, Objects } from '../../utils';

import { PATH_SEPARATOR } from '../../constants';
import { EntityKey } from '../resource';
import { PathSegmentNames } from '../../types';
import { SegmentHandler } from './handlers';

export type ODataSegment = {
  name: PathSegmentNames;
  path: string;
  type?: string;
  key?: any;
  parameters?: any;
};

function pathSegmentsBuilder(
  segment: ODataSegment
): [string, { [name: string]: any }] {
  if (segment.name === PathSegmentNames.function) {
    let [path, params] = segment.parameters
      ? buildPathAndQuery({ func: { [segment.path]: segment.parameters } })
      : buildPathAndQuery({ func: segment.path });
    if (path.startsWith(PATH_SEPARATOR)) {
      path = path.slice(1);
    }
    return [path, params];
  } else {
    let key = segment.key;
    // HACK: Check guid string
    if (
      typeof key === 'string' &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        key
      )
    ) {
      key = raw(key);
    }
    let [path, params] = key ? buildPathAndQuery({ key }) : ['', {}];
    return [segment.path + path, params];
  }
}

export class ODataPathSegments {
  private _segments: ODataSegment[];

  constructor(segments?: ODataSegment[]) {
    this._segments = segments || [];
  }

  pathAndParams(): [string, { [name: string]: any }] {
    const result = this._segments.reduce(
      (acc, segment) => {
        const [path, params] = pathSegmentsBuilder(segment);
        acc.paths.push(path);
        acc.params = Object.assign(acc.params, params);
        return acc;
      },
      { paths: [] as string[], params: {} as { [name: string]: any } }
    );
    return [result.paths.join(PATH_SEPARATOR), result.params];
  }

  types({ key = false }: { key?: boolean } = {}): string[] {
    return this.segments({ key })
      .map((s) => s.type())
      .filter((t) => t !== undefined) as string[];
  }

  keys(values?: (EntityKey<any> | undefined)[]) {
    const segments = this.segments({ key: true });
    if (values !== undefined) {
      segments.forEach((segment, index) => {
        const key = values[index];
        if (key === undefined) {
          segment.clearKey();
        } else {
          segment.key(key);
        }
      });
    }
    return segments.map((s) => s.key() as EntityKey<any> | undefined);
  }

  toString(): string {
    const [path, params] = this.pathAndParams();
    return (
      path +
      Object.entries(params)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    );
  }

  toJSON() {
    return this._segments.map((s) => ({
      name: s.name,
      type: s.type,
      path: s.path,
      key: s.key,
      parameters: s.parameters,
    }));
  }

  clone() {
    return new ODataPathSegments(Objects.clone(this._segments));
  }

  find(predicate: (segment: ODataSegment) => boolean) {
    //Backward Find
    return [...this._segments].reverse().find(predicate);
  }

  segments({ key = false }: { key?: boolean } = {}) {
    let segments = [...this._segments];
    if (key)
      segments = segments.filter(
        (s) =>
          [
            PathSegmentNames.entitySet,
            PathSegmentNames.navigationProperty,
            PathSegmentNames.property,
          ].indexOf(s.name) !== -1
      );
    return segments.map((s) => new SegmentHandler(s));
  }

  first({ key = false }: { key?: boolean } = {}) {
    const segments = this.segments({ key });
    return segments.length > 0 ? segments[0] : undefined;
  }

  last({ key = false }: { key?: boolean } = {}) {
    const segments = this.segments({ key });
    return segments.length > 0 ? segments[segments.length - 1] : undefined;
  }

  add(name: string, path: string) {
    const segment = { name, path } as ODataSegment;
    this._segments.push(segment);
    return new SegmentHandler(segment);
  }

  get(name: string) {
    let segment = this.find((s) => s.name === name);
    if (segment === undefined)
      throw Error(`No Segment for name ${name} was found`);
    return new SegmentHandler(segment);
  }
}
