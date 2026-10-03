import { NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { NgsHeadlessEditorRuns } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorText } from '../../types';
import {
  ContentEditorBlockRendererInputSignals,
  ContentEditorItemProperty,
  ContentEditorTableBlockSettings,
} from '../../types';
import { getDimensionAttribute } from '../renderer-utils';

export interface ContentEditorTableCell {
  content?: ContentEditorText;
  props?: unknown[];
  styles?: Record<string, unknown>;
  options?: {
    colspan?: number;
    rowspan?: number;
    width?: number | string;
  };
}

@Component({
  selector: 'ngs-content-editor-table-renderer',
  imports: [
    NativeTable,
    NgsHeadlessEditorRuns,
  ],
  templateUrl: './table-renderer.html',
  styleUrl: './table-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-table-renderer',
  },
})
export class ContentEditorTableRenderer implements ContentEditorBlockRendererInputSignals<
  ContentEditorTableCell[][],
  ContentEditorTableBlockSettings
> {
  block = input<NgsHeadlessEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<ContentEditorTableCell[][]>([]);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<ContentEditorTableBlockSettings>({});
  index = input<number>(0);

  protected readonly header = computed(() => this.block()?.attrs?.['header'] === true);
  protected readonly rows = computed(() => this.content() || []);
  protected readonly firstRow = computed(() => this.rows()[0] || []);

  protected width(cell: ContentEditorTableCell): number | null {
    return getDimensionAttribute(cell.options?.width);
  }

  protected colSpan(cell: ContentEditorTableCell): number {
    return cell.options?.colspan || 1;
  }

  protected rowSpan(cell: ContentEditorTableCell): number {
    return cell.options?.rowspan || 1;
  }
}
