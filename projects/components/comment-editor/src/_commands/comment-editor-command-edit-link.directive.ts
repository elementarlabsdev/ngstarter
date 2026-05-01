import { DestroyRef, Directive, inject } from '@angular/core';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COMMENT_EDITOR, CommentEditorInterface } from '../types';
import { LinkDialog } from '../link/link.dialog';

@Directive({
  selector: '[ngsCommentEditorCommandEditLink]',
  standalone: true,
  host: {
    '[class.button]': 'true',
    '(click)': `onClick()`
  }
})
export class CommentEditorCommandEditLinkDirective {
  private _destroyRef = inject(DestroyRef);
  private _dialog = inject(Dialog);
  protected commentEditor = inject<CommentEditorInterface>(COMMENT_EDITOR);
  protected setLinkActive = false;

  protected onClick(): void {
    this.setLinkActive = true;
    const dialogRef = this._dialog.open(LinkDialog, {
      data: {
        linkUrl: (this.commentEditor.api.editor().getAttributes('link') as HTMLLinkElement).href
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((linkUrl: string) => {
        this.setLinkActive = false;

        if (typeof linkUrl === 'undefined') {
          return;
        }

        this._setLink(linkUrl);
      })
    ;
  }

  private _setLink(url: string): void {
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      this.commentEditor.api.editor()
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()
      ;
      return;
    }

    // update link
    this.commentEditor.api.editor()
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
    ;
  }
}
