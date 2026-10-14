import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ContentEditorRendererBase, contentEditorResourceUrl } from '@ngstarter-ui/components/content-editor';
import { Button } from '@ngstarter-ui/components/button';
import { BookmarkContent } from '../bookmark-block/bookmark-block';

@Component({ selector: 'app-bookmark-renderer', imports: [Button], templateUrl: './bookmark-renderer.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookmarkRenderer extends ContentEditorRendererBase<BookmarkContent> {
  readonly url = computed(() => contentEditorResourceUrl(this.content()?.url ?? ''));
}
