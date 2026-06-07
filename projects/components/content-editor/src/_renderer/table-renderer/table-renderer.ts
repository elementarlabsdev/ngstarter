import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorItemProperty,
  ContentEditorTableBlockSettings,
} from '../../types';
import { getDimensionAttribute } from '../renderer-utils';

export interface ContentEditorTableCell {
  content?: string;
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
    SafeHtmlPipe,
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
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<ContentEditorTableCell[][]>([]);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<ContentEditorTableBlockSettings>({});
  index = input<number>(0);

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
