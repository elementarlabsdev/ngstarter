import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { LinkDialog } from '../link/link.dialog';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';

@Directive({
  selector: '[ngsCommentEditorCommandEditLink]',
  host: {
    '[class.button]': 'true',
    '(mousedown)': 'preserveSelection($event)',
    '(click)': 'open($event)'
  }
})
export class CommentEditorCommandEditLinkDirective {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  protected readonly commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected open(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dialog.open(LinkDialog, {
      data: {
        linkUrl: this.commentEditor.api.getMarkAttributes('link')?.['href'] ?? ''
      }
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(linkUrl => {
        if (typeof linkUrl === 'string') {
          this.commentEditor.api.setLink(linkUrl);
          this.commentEditor.api.focus();
        }
      });
  }
}
