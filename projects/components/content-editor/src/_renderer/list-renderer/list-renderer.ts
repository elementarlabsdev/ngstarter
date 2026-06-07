import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorItemProperty,
  ContentEditorListItem,
  ContentEditorListSettings,
} from '../../types';

@Component({
  selector: 'ngs-content-editor-list-renderer',
  imports: [
    NgTemplateOutlet,
    SafeHtmlPipe,
  ],
  templateUrl: './list-renderer.html',
  styleUrl: './list-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-list-renderer',
    '[class.list-bullet]': "listStyle() === 'bullet'",
    '[class.list-ordered]': "listStyle() === 'ordered'",
  },
})
export class ContentEditorListRenderer implements ContentEditorBlockRendererInputSignals<
  ContentEditorListItem[],
  Partial<ContentEditorListSettings>
> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<ContentEditorListItem[]>([]);
  props = input<ContentEditorItemProperty[]>([]);
  settings = input<Partial<ContentEditorListSettings>>({});
  index = input<number>(0);

  protected readonly items = computed(() => this.content() || []);
  protected readonly listStyle = computed(() => this.settings()?.listStyle || 'bullet');

  protected childItems(item: ContentEditorListItem): ContentEditorListItem[] {
    return item.children || [];
  }
}
