// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

import type { MediaType } from "./media_type.ts";

/** Additional meta data that is used to enrich the output of the module
 * graph. */
export interface CacheInfo {
  /** The string path to where the local version of the content is located. For
   * non `file:` URLs, this is the location of the cached content, otherwise it
   * is the absolute path to the local file. */
  local?: string;
  /** The string path to where a transpiled version of the source content is
   * located, if any. */
  emit?: string;
  /** The string path to where an external source map of the transpiled source
   * content is located, if any. */
  map?: string;
}

export interface TypesDependency {
  /** The string URL to the type information for the module. */
  types: string;
  /** An optional range which indicates the source of the dependency. */
  source?: Range;
}

export interface LoadResponseModule {
  /** A module with code has been loaded. */
  kind: "module";
  /** The string URL of the resource. If there were redirects, the final
   * specifier should be set here, otherwise the requested specifier. */
  specifier: string;
  /** For remote resources, a record of headers should be set, where the key's
   * have been normalized to be lower case values. */
  headers?: Record<string, string>;
  /** The string value of the loaded resources. */
  content: string;
}

export interface LoadResponseExternal {
  /** The loaded module is either _external_ or _built-in_ to the runtime. */
  kind: "external";
  /** The strung URL of the resource. If there were redirects, the final
   * specifier should be set here, otherwise the requested specifier. */
  specifier: string;
}

export type LoadResponse = LoadResponseModule | LoadResponseExternal;

export interface PositionJson {
  /** The line number of a position within a source file. The number is a zero
   * based index. */
  line: number;
  /** The character number of a position within a source file. The number is a
   * zero based index. */
  character: number;
}

export interface Range {
  /** A string URL representing a source of a dependency. */
  specifier: string;
  /** The start location of a range of text in a source file. */
  start?: PositionJson;
  /** The end location of a range of text in a source file. */
  end?: PositionJson;
}

export interface RangeJson {
  /** The start location of a range of text in a source file. */
  start: PositionJson;
  /** The end location of a range of text in a source file. */
  end: PositionJson;
}

export interface ResolvedDependency {
  /** The fully resolved string URL of the dependency, which should be
   * resolvable in the module graph. If there was an error, `error` will be set
   * and this will be undefined. */
  specifier?: string;
  /** Any error encountered when trying to resolved the specifier. If this is
   * defined, `specifier` will be undefined. */
  error?: string;
  /** The range within the source code where the specifier was identified. */
  span: RangeJson;
}

export interface TypesDependencyJson {
  /** The string specifier that was used for the dependency. */
  specifier: string;
  /** An object pointing to the resolved dependency. */
  dependency: ResolvedDependency;
}

/** The kind of module.
 *
 * For asserted modules, the value of the `asserted` property is set to the
 * `type` value of the import attribute.
 *
 * Dependency analysis is not performed for asserted or Script modules
 * currently. Synthetic modules were injected into the graph with their own
 * dependencies provided. */
export type ModuleKind =
  | "asserted"
  | "esm"
  | "npm"
  | "external";

export interface DependencyJson {
  /** The string specifier that was used for the dependency. */
  specifier: string;
  /** An object pointing to the resolved _code_ dependency. */
  code?: ResolvedDependency;
  /** An object pointing to the resolved _type_ dependency of a module. This is
   * populated when the `@deno-types` directive was used to supply a type
   * definition file for a dependency. */
  type?: ResolvedDependency;
  /** A flag indicating if the dependency was dynamic. (e.g.
   * `await import("mod.ts")`) */
  isDynamic?: true;
  assertionType?: string;
}

// todo(dsherret): split this up into separate types based on the "kind"

export interface ModuleJson extends CacheInfo {
  /** The string URL of the module. */
  specifier: string;
  /** Any error encountered when attempting to load the module. */
  error?: string;
  /** The module kind that was determined when the module was resolved. This is
   * used by loaders to indicate how a module needs to be loaded at runtime. */
  kind?: ModuleKind;
  /** An array of dependencies that were identified in the module. */
  dependencies?: DependencyJson[];
  /** If the module had a types dependency, the information about that
   * dependency. */
  typesDependency?: TypesDependencyJson;
  /** The resolved media type of the module, which determines how Deno will
   * handle the module. */
  mediaType?: MediaType;
  /** The size of the source content of the module in bytes. */
  size?: number;
}

export interface GraphImportJson {
  /** The referrer (URL string) that was used as a base when resolving the
   * imports added to the graph. */
  referrer: string;
  /** An array of resolved dependencies which were imported using the
   * referrer. */
  dependencies?: DependencyJson[];
}

/** The plain-object representation of a module graph that is suitable for
 * serialization to JSON. */
export interface ModuleGraphJson {
  /** The module specifiers (URL string) of the _roots_ of the module graph of
   * which the module graph was built for. */
  roots: string[];
  /** An array of modules that are part of the module graph. */
  modules: ModuleJson[];
  /** External imports that were added to the graph when it was being built.
   * The key is the referrer which was used as a base to resolve the
   * dependency. The value is the resolved dependency. */
  imports?: GraphImportJson[];
  /** A record/map of any redirects encountered when resolving modules. The
   * key was the requested module specifier and the value is the redirected
   * module specifier. */
  redirects: Record<string, string>;
}

export interface Dependency {
  /** An object pointing to the resolved _code_ dependency. */
  code?: ResolvedDependency;
  /** An object pointing to the resolved _type_ dependency of a module. This is
   * populated when the `@deno-types` directive was used to supply a type
   * definition file for a dependency. */
  type?: ResolvedDependency;
  /** A flag indicating if the dependency was dynamic. (e.g.
   * `await import("mod.ts")`) */
  isDynamic?: true;
}
