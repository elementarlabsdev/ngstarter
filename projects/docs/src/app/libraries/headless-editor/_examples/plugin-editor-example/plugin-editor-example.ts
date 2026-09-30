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

const toggleUnderline: NgsHeadlessEditorCommand<void> = {
  id: 'toggle-underline',
  execute: editor => editor.toggleMark('underline'),
  // canApplyMark() also answers for nested editors such as table cells.
  enabled: editor => editor.canApplyMark('underline'),
  active: editor => editor.isMarkActive('underline')
};

const underlinePlugin = defineNgsHeadlessEditorPlugin({
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
    NgsHeadlessEditorSurface,
    NgsHeadlessEditorCommandDirective
  ],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(colorEditorPlugin()),
      withHeadlessEditorPlugin(underlinePlugin)
    )
  ],
  templateUrl: './plugin-editor-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly toggleUnderline = toggleUnderline;
  readonly setTextColor = NGS_HEADLESS_EDITOR_SET_TEXT_COLOR;
  readonly unsetTextColor = NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR;
  readonly setBackgroundColor = NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR;
  readonly unsetBackgroundColor = NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR;

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument('Select text and apply the custom underline mark.'));
  }
}
