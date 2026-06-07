import { ChangeDetectionStrategy, Component, Type, computed, inject, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CONTENT_EDITOR_BLOCK_RENDERERS } from '../_renderer/content-editor-renderer.config';
import { CONTENT_EDITOR_DEFAULT_RENDERERS } from '../_renderer/default-renderers';
import { ContentEditorBlock, ContentEditorBlockRendererDef } from '../types';

interface ContentEditorRenderItem {
  block: ContentEditorBlock;
  component: Type<unknown> | null;
  inputs: Record<string, unknown>;
}

@Component({
  selector: 'ngs-content-editor-renderer',
  exportAs: 'ngsContentEditorRenderer',
  imports: [
    NgComponentOutlet,
  ],
  templateUrl: './content-editor-renderer.html',
  styleUrl: './content-editor-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-renderer prose max-w-full',
  },
})
export class ContentEditorRenderer {
  private readonly providedRendererGroups = inject(CONTENT_EDITOR_BLOCK_RENDERERS, {
    optional: true,
  }) || [];

  content = input<ReadonlyArray<ContentEditorBlock>>([]);
  blocks = input<ReadonlyArray<ContentEditorBlock> | null>(null);

  readonly rendererMap = computed(() => {
    const renderers: ContentEditorBlockRendererDef[] = [
      ...CONTENT_EDITOR_DEFAULT_RENDERERS,
      ...this.providedRendererGroups.flat(),
    ];

    return new Map(renderers.map(renderer => [renderer.type, renderer.component]));
  });

  protected readonly items = computed<ContentEditorRenderItem[]>(() => {
    const content = this.blocks() || this.content() || [];
    const rendererMap = this.rendererMap();

    return content.map((block, index) => ({
      block,
      component: rendererMap.get(block.type) || null,
      inputs: {
        block,
        id: block.id,
        type: block.type,
        content: block.content,
        props: block.props || [],
        settings: block.settings || {},
        index,
      },
    }));
  });
}
