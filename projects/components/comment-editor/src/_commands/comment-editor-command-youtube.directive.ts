import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';
import { YoutubeDialog } from '../youtube/youtube.dialog';

@Directive({
  selector: '[ngsCommentEditorCommandYoutube]',
  host: {
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'open($event)'
  }
})
export class CommentEditorCommandYoutubeDirective {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected open(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dialog.open(YoutubeDialog, { data: { linkUrl: '' } })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(linkUrl => {
        if (typeof linkUrl === 'string' && linkUrl) {
          this.commentEditor.api.insertYoutube(linkUrl);
          this.commentEditor.api.focus();
        }
      });
  }
}
