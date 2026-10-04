import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-editor-renderer-api.scss',
})
export class ContentEditorRendererApi {
  readonly importExample = `import {
  ContentEditorRenderer,
  provideContentEditorRenderer,
  provideContentEditorRenderers,
  ContentEditorBlockRendererDef,
  ContentEditorBlockRendererInputSignals
} from '@ngstarter-ui/components/content-editor';`;

  readonly selectorExample = `<ngs-content-editor-renderer [content]="document"/>`;

  readonly inputs: ApiRow[] = [
    {
      name: 'config',
      description: 'Instance HTML export overrides, merged over the environment configuration. Does not replace Angular renderer components.',
      type: 'ContentEditorConfig',
      default: '{}'
    },
    {
      name: 'content',
      description: 'Headless editor document to render. Text content uses runs with marks; block settings and properties live in attrs.',
      type: 'ContentEditorDocument',
      default: 'Empty headless document'
    },
    {
      name: 'blocks',
      description: 'Native block array. When provided, it takes precedence over content.blocks.',
      type: 'ReadonlyArray<NgsHeadlessEditorBlock> | null',
      default: 'null'
    },
  ];

  readonly providers: ApiRow[] = [
    {
      name: 'provideContentEditorConfig(config)',
      description: 'Configures shared block HTML converters, text marks and block options through environment providers. Renderer.toHtml(config) can override them for one call.',
      type: 'EnvironmentProviders',
      default: 'Built-in HTML converters'
    },
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
      type: 'NgsHeadlessEditorBlock | null',
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
