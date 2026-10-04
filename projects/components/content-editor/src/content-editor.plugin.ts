import { Provider } from '@angular/core';
import {
  basicTextEditorPlugin, colorEditorPlugin, linkEditorPlugin,
  provideNgsHeadlessEditor, withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

/** Shared marks and commands for content editing and read-only rendering. */
export function provideContentEditor(): Provider[] {
  return provideNgsHeadlessEditor(
    withHeadlessEditorPlugin(basicTextEditorPlugin()),
    withHeadlessEditorPlugin(colorEditorPlugin()),
    withHeadlessEditorPlugin(linkEditorPlugin())
  );
}
