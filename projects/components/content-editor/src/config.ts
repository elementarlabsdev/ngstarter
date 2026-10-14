import type { ContentEditorBlock } from './types';
import type { ContentEditorDraftConfig } from './draft';
import { EnvironmentProviders, InjectionToken, inject, makeEnvironmentProviders, Signal, Type } from '@angular/core';
import { ContentEditorBlockHtmlConverter, ContentEditorMarkHtmlConverter } from './html/types';
import { ContentEditorHtmlSerializer } from './html/html-serializer';
import { ContentEditorImporter } from './import/content-importer';
import type { ContentEditorBlockHtmlImporter, ContentEditorBlockImportValidator, ContentEditorImportMarkDefinition } from './import/types';

export interface ContentEditorBlockConfig {
  /** Eager component, or loadEditor for lazy loading; the lazy loader takes precedence. */
  editor?: Type<unknown>;
  loadEditor?: () => Promise<Type<unknown>>;
  renderer?: Type<unknown>;
  /** Native initial data. The editor supplies a fresh id and the configured type. */
  create?: () => Pick<ContentEditorBlock, 'content' | 'attrs'>;
  /** Adds the block to the global insertion menu. */
  menu?: { title: string; description?: string; iconName?: string; settings?: Readonly<Record<string, unknown>> };
  toHtml?: ContentEditorBlockHtmlConverter;
  fromHtml?: ContentEditorBlockHtmlImporter;
  validateImport?: ContentEditorBlockImportValidator;
  options?: Readonly<Record<string, unknown>>;
}

export interface ContentEditorConfig {
  blocks?: Readonly<Record<string, ContentEditorBlockConfig>>;
  marks?: Readonly<Record<string, ContentEditorMarkHtmlConverter>>;
  includeStyles?: boolean;
  draft?: ContentEditorDraftConfig;
  /** Additional or overridden mark definitions used when importing HTML. */
  importMarks?: readonly ContentEditorImportMarkDefinition[];
  /** Unknown blocks throw by default to avoid silently losing saved content. */
  unknownBlockToHtml?: ContentEditorBlockHtmlConverter;
}

/** Nested renderers inherit per-instance configuration through their parent. */
export const CONTENT_EDITOR_RENDER_CONFIG = new InjectionToken<Signal<ContentEditorConfig>>('CONTENT_EDITOR_RENDER_CONFIG');

export const CONTENT_EDITOR_CONFIG = new InjectionToken<ContentEditorConfig>('CONTENT_EDITOR_CONFIG', {
  providedIn: 'root', factory: () => ({})
});

/** Later configurations override individual block fields, preserving unrelated options. */
export function mergeContentEditorConfig(...configs: readonly ContentEditorConfig[]): ContentEditorConfig {
  const result: ContentEditorConfig = { blocks: Object.create(null), marks: {} };
  for (const config of configs) {
    for (const [type, block] of Object.entries(config.blocks ?? {})) {
      const previous = result.blocks![type];
      (result.blocks as Record<string, ContentEditorBlockConfig>)[type] = {
        ...previous, ...block, options: { ...previous?.options, ...block.options }
      };
    }
    result.marks = { ...result.marks, ...config.marks };
    if (config.draft !== undefined) result.draft = { ...result.draft, ...config.draft };
    if (config.includeStyles !== undefined) result.includeStyles = config.includeStyles;
    if (config.importMarks !== undefined) result.importMarks = config.importMarks;
    if (config.unknownBlockToHtml !== undefined) result.unknownBlockToHtml = config.unknownBlockToHtml;
  }
  return result;
}

/** Application or route environment configuration. Child environments inherit parent settings. */
export function provideContentEditorConfig(config: ContentEditorConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CONTENT_EDITOR_CONFIG,
      useFactory: () => mergeContentEditorConfig(inject(CONTENT_EDITOR_CONFIG, { skipSelf: true, optional: true }) ?? {}, config)
    },
    ContentEditorHtmlSerializer,
    ContentEditorImporter
  ]);
}
