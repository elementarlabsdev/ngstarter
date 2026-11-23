import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  createNgsHeadlessEditorDocument,
  defineNgsHeadlessEditorPlugin,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_HEADLESS_EDITOR_SET_TEXT_COLOR,
  NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR,
  NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

const toggleKeyboard: NgsHeadlessEditorCommand<void> = {
  id: 'toggle-keyboard',
  execute: editor => editor.toggleMark('keyboard'),
  // canApplyMark() also answers for nested editors such as table cells.
  enabled: editor => editor.canApplyMark('keyboard'),
  active: editor => editor.isMarkActive('keyboard')
};

const keyboardPlugin = defineNgsHeadlessEditorPlugin({
  id: 'keyboard',
  marks: [
    { type: 'keyboard', tagName: 'kbd' }
  ],
  commands: [toggleKeyboard],
  keymap: [
    { key: 'Mod-Alt-k', command: toggleKeyboard }
  ]
});

@Component({
  selector: 'app-plugin-editor-example',
  imports: [
    JsonPipe,
    Button,
    NgsHeadlessEditorSurface,
    NgsHeadlessEditorCommandDirective
  ],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(colorEditorPlugin()),
      withHeadlessEditorPlugin(keyboardPlugin)
    )
  ],
  templateUrl: './plugin-editor-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly toggleKeyboard = toggleKeyboard;
  readonly setTextColor = NGS_HEADLESS_EDITOR_SET_TEXT_COLOR;
  readonly unsetTextColor = NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR;
  readonly setBackgroundColor = NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR;
  readonly unsetBackgroundColor = NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR;

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument('Select text and apply the custom keyboard mark.'));
  }
}
