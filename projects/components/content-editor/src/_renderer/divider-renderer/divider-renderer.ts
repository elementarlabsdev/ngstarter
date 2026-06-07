import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Divider } from '@ngstarter-ui/components/divider';
import { ContentEditorBlock, ContentEditorBlockRendererInputSignals, ContentEditorItemProperty } from '../../types';

@Component({
  selector: 'ngs-content-editor-divider-renderer',
  imports: [
    Divider,
  ],
  templateUrl: './divider-renderer.html',
  styleUrl: './divider-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-divider-renderer',
  },
})
export class ContentEditorDividerRenderer implements ContentEditorBlockRendererInputSignals<unknown, Record<string, unknown>> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<unknown>(null);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Record<string, unknown>>({});
  index = input<number>(0);
}
