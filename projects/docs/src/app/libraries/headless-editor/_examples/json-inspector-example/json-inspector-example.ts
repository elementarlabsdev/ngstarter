import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorText,
  NgsHeadlessEditor,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

const SAMPLE: NgsHeadlessEditorDocument = {
  version: 1,
  blocks: [
    {
      id: createNgsHeadlessEditorId('paragraph'),
      type: 'paragraph',
      content: [
        createNgsHeadlessEditorText('Text runs carry '),
        createNgsHeadlessEditorText('marks', [{ type: 'bold' }, { type: 'italic' }]),
        createNgsHeadlessEditorText(' and marks carry '),
        createNgsHeadlessEditorText('attributes', [{ type: 'textColor', attrs: { color: '#7c3aed' } }]),
        createNgsHeadlessEditorText('.')
      ]
    },
    {
      id: createNgsHeadlessEditorId('paragraph'),
      type: 'paragraph',
      content: [createNgsHeadlessEditorText('Edit the JSON on the right and apply it.')]
    }
  ]
};

@Component({
  selector: 'app-json-inspector-example',
  imports: [Button, NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(colorEditorPlugin())
    )
  ],
  templateUrl: './json-inspector-example.html',
  styleUrl: './json-inspector-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonInspectorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly json = computed(() => JSON.stringify(this.editor.document(), null, 2));
  readonly draft = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.editor.setDocument(SAMPLE);
  }

  apply(): void {
    try {
      const parsed = JSON.parse(this.draft() ?? this.json()) as NgsHeadlessEditorDocument;
      if (parsed?.version !== 1 || !Array.isArray(parsed.blocks)) {
        throw new Error('Expected { "version": 1, "blocks": [...] }');
      }
      // setDocument() copies and normalizes the input: missing or duplicate ids are
      // regenerated, empty runs dropped and adjacent runs with equal marks merged.
      this.editor.setDocument(parsed);
      this.draft.set(null);
      this.error.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    }
  }

  onDraft(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }
}
