import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-text-editor-toolbar',
  exportAs: 'ngsTextEditorToolbar',
  imports: [],
  templateUrl: './text-editor-toolbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './text-editor-toolbar.scss'
})
export class TextEditorToolbar {
}
