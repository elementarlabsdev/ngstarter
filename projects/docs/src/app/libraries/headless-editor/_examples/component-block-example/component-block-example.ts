import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorParagraph,
  defineNgsHeadlessEditorPlugin,
  NgsHeadlessEditor,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';
import { createCalloutBlock } from './callout';
import { CalloutBlock } from './callout-block/callout-block';
import { CalloutPreview } from './callout-preview/callout-preview';

const calloutPlugin = defineNgsHeadlessEditorPlugin({
  id: 'callout',
  blocks: [
    {
      type: 'callout',
      tagName: 'aside',
      create: () => createCalloutBlock({ tone: 'info', text: '' }),
      isEmpty: () => false,
      editorComponent: CalloutBlock,
      rendererComponent: CalloutPreview
    }
  ]
});

@Component({
  selector: 'app-component-block-example',
  imports: [JsonPipe, Button, NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(calloutPlugin)
    )
  ],
  templateUrl: './component-block-example.html',
  styleUrl: './component-block-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentBlockExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly readOnly = signal(false);

  constructor() {
    this.editor.setDocument({
      version: 1,
      blocks: [
        createNgsHeadlessEditorParagraph('Callouts are Angular components that live inside the document.'),
        createCalloutBlock({ tone: 'warning', text: 'Maintenance window starts at 22:00 UTC.' }),
        createNgsHeadlessEditorParagraph('Edit the callout text, change its tone, or switch to read-only.')
      ]
    });
  }

  insertCallout(): void {
    this.editor.insertBlock(createCalloutBlock({ tone: 'info', text: 'New callout' }));
  }

  toggleReadOnly(): void {
    this.readOnly.update(value => !value);
    this.editor.setReadOnly(this.readOnly());
  }
}
