import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';
import {
  ContentEditorBlock,
  ContentEditorBlockRendererInputSignals,
  ContentEditorHeadingBlockSettings,
  ContentEditorItemProperty,
} from '../../types';
import { getHtmlContent, getTextAlignment } from '../renderer-utils';

@Component({
  selector: 'ngs-content-editor-heading-renderer',
  imports: [
    SafeHtmlPipe,
  ],
  templateUrl: './heading-renderer.html',
  styleUrl: './heading-renderer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-content-editor-heading-renderer',
    '[class.level-1]': 'level() === 1',
    '[class.level-2]': 'level() === 2',
    '[class.level-3]': 'level() === 3',
  },
})
export class ContentEditorHeadingRenderer implements ContentEditorBlockRendererInputSignals<
  unknown,
  Partial<ContentEditorHeadingBlockSettings>
> {
  block = input<ContentEditorBlock | null>(null);
  id = input<string>('');
  type = input<string>('');
  content = input<unknown>('');
  settings = input<Partial<ContentEditorHeadingBlockSettings>>({});
  props = input<ContentEditorItemProperty[]>([]);
  index = input<number>(0);

  protected readonly html = computed(() => getHtmlContent(this.content()));
  protected readonly level = computed(() => {
    const level = this.settings()?.level;
    return level === 1 || level === 2 || level === 3 ? level : 2;
  });
  protected readonly alignment = computed(() => getTextAlignment(this.props()));
}
