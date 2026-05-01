import { DestroyRef, Directive, inject } from '@angular/core';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TEXT_EDITOR, TextEditorInterface } from '../types';
import { LinkDialog } from '../link/link.dialog';

@Directive({
  selector: '[ngsTextEditorCommandLink]',
  exportAs: 'ngsTextEditorCommandLink',
  host: {
    '[attr.disabled]': `(textEditor && textEditor.api.isCommandDisabled('toggleLink')) ? '' : null`,
    '[class.active]': `textEditor && textEditor.api.isActive('link')`,
    '(click)': `onClick()`
  }
})
export class TextEditorCommandLinkDirective {
  private _destroyRef = inject(DestroyRef);
  private _dialog = inject(Dialog);
  protected textEditor = inject<TextEditorInterface>(TEXT_EDITOR);
  protected setLinkActive = false;

  protected onClick(): void {
    this.setLinkActive = true;
    const dialogRef = this._dialog.open(LinkDialog, {
      data: {
        linkUrl: (this.textEditor.api.editor().getAttributes('link') as HTMLLinkElement).href
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
      this.textEditor.api.editor()
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()
      ;
      return;
    }

    // update link
    this.textEditor.api.editor()
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run()
    ;
  }
}
