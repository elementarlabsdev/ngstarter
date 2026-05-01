import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsTextEditorCommand]',
  exportAs: 'ngsTextEditorCommand',
  host: {
    '[class.button]': 'true'
  }
})
export class TextEditorCommandDirective {
}
