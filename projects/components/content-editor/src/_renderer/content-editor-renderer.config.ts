import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { ContentEditorBlockRendererDef } from '../types';

export const CONTENT_EDITOR_BLOCK_RENDERERS = new InjectionToken<
  ReadonlyArray<ReadonlyArray<ContentEditorBlockRendererDef>>
>('CONTENT_EDITOR_BLOCK_RENDERERS', {
  factory: () => [],
});

export function provideContentEditorRenderers(
  renderers: ReadonlyArray<ContentEditorBlockRendererDef>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CONTENT_EDITOR_BLOCK_RENDERERS,
      useValue: renderers,
      multi: true,
    },
  ]);
}

export function provideContentEditorRenderer(
  renderer: ContentEditorBlockRendererDef,
): EnvironmentProviders {
  return provideContentEditorRenderers([renderer]);
}
