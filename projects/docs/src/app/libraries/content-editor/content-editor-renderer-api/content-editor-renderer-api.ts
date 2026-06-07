import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

type ApiRow = {
  name: string;
  description: string;
  type: string;
  default: string;
};

@Component({
  selector: 'app-content-editor-renderer-api',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    CodeHighlighter,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './content-editor-renderer-api.html',
  styleUrl: './content-editor-renderer-api.scss',
})
export class ContentEditorRendererApi {
  readonly displayedColumns = ['name', 'type', 'default'];

  readonly importExample = `import {
  ContentEditorRenderer,
  provideContentEditorRenderer,
  provideContentEditorRenderers,
  ContentEditorBlockRendererDef,
  ContentEditorBlockRendererInputSignals
} from '@ngstarter-ui/components/content-editor';`;

  readonly selectorExample = `<ngs-content-editor-renderer [content]="blocks"/>`;

  readonly inputs: ApiRow[] = [
    {
      name: 'content',
      description: 'Saved content editor blocks to render. Use this for persisted block JSON and preview data.',
      type: 'ReadonlyArray<ContentEditorBlock>',
      default: '[]'
    },
    {
      name: 'blocks',
      description: 'Alternative input for the same block array. When provided, it takes precedence over content.',
      type: 'ReadonlyArray<ContentEditorBlock> | null',
      default: 'null'
    },
  ];

  readonly providers: ApiRow[] = [
    {
      name: 'provideContentEditorRenderers(renderers)',
      description: 'Registers multiple custom block renderer definitions through an environment provider.',
      type: 'EnvironmentProviders',
      default: 'Adds to default renderers'
    },
    {
      name: 'provideContentEditorRenderer(renderer)',
      description: 'Registers one custom block renderer definition.',
      type: 'EnvironmentProviders',
      default: 'Adds to default renderers'
    },
    {
      name: 'CONTENT_EDITOR_BLOCK_RENDERERS',
      description: 'Multi provider token used internally by the renderer to collect registered renderer definitions.',
      type: 'InjectionToken<ReadonlyArray<ReadonlyArray<ContentEditorBlockRendererDef>>>',
      default: '[]'
    },
  ];

  readonly rendererDef: ApiRow[] = [
    {
      name: 'type',
      description: 'Block type handled by this renderer, for example paragraph, heading, image, or a custom block type.',
      type: 'string',
      default: 'Required'
    },
    {
      name: 'component',
      description: 'Standalone Angular component used for blocks with the matching type.',
      type: 'Type<unknown>',
      default: 'Required'
    },
  ];

  readonly rendererInputs: ApiRow[] = [
    {
      name: 'block',
      description: 'Original block object passed to the renderer.',
      type: 'ContentEditorBlock | null',
      default: 'null'
    },
    {
      name: 'id',
      description: 'Block id.',
      type: 'string',
      default: "''"
    },
    {
      name: 'type',
      description: 'Block type used to resolve the renderer.',
      type: 'string',
      default: "''"
    },
    {
      name: 'content',
      description: 'Block content payload. The shape depends on the block type.',
      type: 'TContent',
      default: 'undefined'
    },
    {
      name: 'props',
      description: 'Inline or block-level properties saved by the editor.',
      type: 'ContentEditorItemProperty[]',
      default: '[]'
    },
    {
      name: 'settings',
      description: 'Block settings payload. The shape depends on the block type.',
      type: 'TSettings',
      default: '{}'
    },
    {
      name: 'index',
      description: 'Zero-based block position in the rendered content array.',
      type: 'number',
      default: '0'
    },
  ];
}
