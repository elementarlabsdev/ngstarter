import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  createNgsEditorDocument,
  defineNgsEditorPlugin,
  NgsEditor,
  NgsEditorCommand,
  NgsEditorCommandDirective,
  NgsEditorSurface,
  NGS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_EDITOR_SET_TEXT_COLOR,
  NGS_EDITOR_UNSET_BACKGROUND_COLOR,
  NGS_EDITOR_UNSET_TEXT_COLOR,
  provideNgsEditor,
  withEditorPlugin
} from '@ngstarter-ui/components/editor';

const toggleUnderline: NgsEditorCommand<void> = {
  id: 'toggle-underline',
  execute: editor => editor.toggleMark('underline'),
  active: editor => editor.isMarkActive('underline')
};

const underlinePlugin = defineNgsEditorPlugin({
  id: 'underline',
  marks: [
    { type: 'underline', tagName: 'u' }
  ],
  commands: [toggleUnderline],
  keymap: [
    { key: 'Mod-u', command: toggleUnderline }
  ]
});

@Component({
  selector: 'app-plugin-editor-example',
  imports: [
    JsonPipe,
    Button,
    NgsEditorSurface,
    NgsEditorCommandDirective
  ],
  providers: [
    provideNgsEditor(
      withEditorPlugin(basicTextEditorPlugin()),
      withEditorPlugin(colorEditorPlugin()),
      withEditorPlugin(underlinePlugin)
    )
  ],
  templateUrl: './plugin-editor-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginEditorExample {
  readonly editor = inject(NgsEditor);
  readonly toggleUnderline = toggleUnderline;
  readonly setTextColor = NGS_EDITOR_SET_TEXT_COLOR;
  readonly unsetTextColor = NGS_EDITOR_UNSET_TEXT_COLOR;
  readonly setBackgroundColor = NGS_EDITOR_SET_BACKGROUND_COLOR;
  readonly unsetBackgroundColor = NGS_EDITOR_UNSET_BACKGROUND_COLOR;

  constructor() {
    this.editor.setDocument(createNgsEditorDocument('Select text and apply the custom underline mark.'));
  }
}
