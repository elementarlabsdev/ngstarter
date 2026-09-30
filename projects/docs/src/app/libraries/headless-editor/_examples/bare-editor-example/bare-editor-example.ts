import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorDocument,
  NgsHeadlessEditor,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

@Component({
  selector: 'app-bare-editor-example',
  imports: [JsonPipe, NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin())
    )
  ],
  templateUrl: './bare-editor-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BareEditorExample {
  readonly editor = inject(NgsHeadlessEditor);

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument('This is a completely unstyled editor surface.'));
  }
}
