import { DestroyRef, Directive, inject } from '@angular/core';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEXT_EDITOR, TextEditorInterface } from '../types';
import { YoutubeDialog } from '../youtube/youtube.dialog';

@Directive({
  selector: '[ngsTextEditorCommandYoutube]',
  exportAs: 'ngsTextEditorCommandYoutube',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleBlockquote')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('blockquote')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandYoutubeDirective {
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);
  private _dialog = inject(Dialog);
  private _destroyRef = inject(DestroyRef);

  protected onClick(): void {
    const dialogRef = this._dialog.open(YoutubeDialog, {
      data: {
        linkUrl: (this.textEditor.api.editor().getAttributes('iframe') as HTMLIFrameElement).src
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

        this.textEditor.api.editor().commands.setYoutubeVideo({
          src: linkUrl
        });
      })
    ;
  }
}
