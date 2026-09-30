import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField } from '@ngstarter-ui/components/form-field';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  createNgsHeadlessEditorDocument,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';
import { Input } from '@ngstarter-ui/components/input';
import { draftStoragePlugin, EditorStats, linkEditorPlugin, SET_LINK, UNSET_LINK } from './link.plugin';

const DRAFT_KEY = 'ngs-headless-editor-plugins-example';

@Component({
  selector: 'app-custom-plugin-example',
  imports: [
    FormsModule,
    Button,
    FormField,
    Input,
    NgsHeadlessEditorSurface,
    NgsHeadlessEditorCommandDirective
  ],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(colorEditorPlugin()),
      withHeadlessEditorPlugin(linkEditorPlugin())
    )
  ],
  templateUrl: './custom-plugin-example.html',
  styleUrl: './custom-plugin-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomPluginExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly stats = inject(EditorStats);
  readonly setLink = SET_LINK;
  readonly unsetLink = UNSET_LINK;
  readonly href = signal('https://ngstarter.com');
  readonly restored = signal(false);
  readonly draftPlugin = draftStoragePlugin(DRAFT_KEY, () => this.restored.set(true));

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument(
      'Select a word and apply a link, or paste a URL. Ctrl/Cmd+Shift+H highlights the selection.'
    ));
    // Plugins can also be installed at runtime. setPlugins() replaces the whole set,
    // so keep the provided plugins and append the new one.
    this.installDraftPlugin();
  }

  get draftInstalled(): boolean {
    return this.editor.plugins().includes(this.draftPlugin);
  }

  installDraftPlugin(): void {
    this.editor.setPlugins([...this.editor.plugins(), this.draftPlugin]);
  }

  removeDraftPlugin(): void {
    // Runs the plugin cleanup, which saves the draft one last time.
    this.editor.setPlugins(this.editor.plugins().filter(plugin => plugin !== this.draftPlugin));
  }

  forgetDraft(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
    this.restored.set(false);
  }
}
