import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';
import { YoutubeDialog } from '../youtube/youtube.dialog';

@Directive({
  selector: '[ngsCommentEditorCommandYoutube]',
  standalone: true,
  host: {
    '[attr.disabled]': `(commentEditor && commentEditor.api.isCommandDisabled('toggleBlockquote')) ? '' : null`,
    '[class.active]': `commentEditor && commentEditor.api.isActive('blockquote')`,
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandYoutubeDirective {
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);
  private _dialog = inject(Dialog);
  private _destroyRef = inject(DestroyRef);

  protected onClick(): void {
    const dialogRef = this._dialog.open(YoutubeDialog, {
      data: {
        linkUrl: (this.commentEditor.api.editor().getAttributes('iframe') as HTMLIFrameElement).src
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((linkUrl: string) => {
        if (typeof linkUrl === 'undefined') {
          return;
        }

        this.commentEditor.api.editor().commands.setYoutubeVideo({
          src: linkUrl
        });
      })
    ;
  }
}
