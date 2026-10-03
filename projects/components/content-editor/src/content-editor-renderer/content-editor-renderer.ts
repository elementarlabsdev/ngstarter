import { NgsHeadlessEditorBlock, createNgsHeadlessEditorDocument } from '@ngstarter-ui/components/headless-editor';
import { provideContentEditor } from '../content-editor.plugin';
import { contentEditorBlockView } from '../document';
import { ContentEditorDocument } from '../types';
import { ChangeDetectionStrategy, Component, Type, computed, inject, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { CONTENT_EDITOR_BLOCK_RENDERERS } from '../_renderer/content-editor-renderer.config';
import { CONTENT_EDITOR_DEFAULT_RENDERERS } from '../_renderer/default-renderers';
import { ContentEditorBlockRendererDef, ContentEditorBlockRendererInputs } from '../types';

interface ContentEditorRenderItem {
  block: NgsHeadlessEditorBlock;
  component: Type<unknown> | null;
  inputs: ContentEditorBlockRendererInputs;
}

@Component({
  selector: 'ngs-content-editor-renderer',
  exportAs: 'ngsContentEditorRenderer',
  providers: [provideContentEditor()],
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

  content = input<ContentEditorDocument>(createNgsHeadlessEditorDocument());
  blocks = input<readonly NgsHeadlessEditorBlock[] | null>(null);

  readonly rendererMap = computed(() => {
    const renderers: ContentEditorBlockRendererDef[] = [
      ...CONTENT_EDITOR_DEFAULT_RENDERERS,
      ...this.providedRendererGroups.flat(),
    ];

    return new Map(renderers.map(renderer => [renderer.type, renderer.component]));
  });

  protected readonly items = computed<ContentEditorRenderItem[]>(() => {
    const content = this.blocks() ?? this.content().blocks;
    const rendererMap = this.rendererMap();

    return content.map((block, index) => {
      const view = contentEditorBlockView(block);
      return {
        block,
        component: rendererMap.get(block.type) || null,
        inputs: {
          block,
          id: block.id,
          type: block.type,
          content: view.content,
          props: view.props || [],
          settings: view.settings || {},
          index,
        },
      };
    });
  });
}
