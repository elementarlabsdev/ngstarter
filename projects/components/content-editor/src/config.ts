import { EnvironmentProviders, InjectionToken, inject, makeEnvironmentProviders } from '@angular/core';
import { ContentEditorBlockHtmlConverter, ContentEditorMarkHtmlConverter } from './html/types';
import { ContentEditorHtmlSerializer } from './html/html-serializer';

export interface ContentEditorBlockConfig {
  toHtml?: ContentEditorBlockHtmlConverter;
  options?: Readonly<Record<string, unknown>>;
}

export interface ContentEditorConfig {
  blocks?: Readonly<Record<string, ContentEditorBlockConfig>>;
  marks?: Readonly<Record<string, ContentEditorMarkHtmlConverter>>;
  includeStyles?: boolean;
  /** Unknown blocks throw by default to avoid silently losing saved content. */
  unknownBlockToHtml?: ContentEditorBlockHtmlConverter;
}

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
    if (config.includeStyles !== undefined) result.includeStyles = config.includeStyles;
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
    ContentEditorHtmlSerializer
  ]);
}
