import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-text-editor-floating-menu',
  exportAs: 'ngsTextEditorFloatingMenu',
  imports: [],
  templateUrl: './text-editor-floating-menu.html',
  styleUrl: './text-editor-floating-menu.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-text-editor-floating-menu'
  }
})
export class TextEditorFloatingMenu {

}
