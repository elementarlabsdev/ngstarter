import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-basic-text-editor-example',
  template: '<p>The previous Text Editor has been removed in favor of the Angular editor foundation.</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicTextEditorExample {}
