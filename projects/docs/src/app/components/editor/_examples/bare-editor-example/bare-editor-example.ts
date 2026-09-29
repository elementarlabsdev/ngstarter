import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  basicTextEditorPlugin,
  createNgsEditorDocument,
  NgsEditor,
  NgsEditorSurface,
  provideNgsEditor,
  withEditorPlugin
} from '@ngstarter-ui/components/editor';

@Component({
  selector: 'app-bare-editor-example',
  imports: [JsonPipe, NgsEditorSurface],
  providers: [
    provideNgsEditor(
      withEditorPlugin(basicTextEditorPlugin())
    )
  ],
  templateUrl: './bare-editor-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BareEditorExample {
  readonly editor = inject(NgsEditor);

  constructor() {
    this.editor.setDocument(createNgsEditorDocument('This is a completely unstyled editor surface.'));
  }
}
