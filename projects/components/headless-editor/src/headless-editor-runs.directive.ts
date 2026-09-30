import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { NgsHeadlessEditor } from './headless-editor';
import { NgsHeadlessEditorText } from './model';
import { renderNgsHeadlessEditorRuns } from './render';

/**
 * Renders text runs with the mark definitions of the nearest editor, exactly as
 * the surface renders them. Use it for read-only previews of rich text such as
 * table cells that are not being edited. Line breaks ("\n") are preserved.
 */
@Directive({
  selector: '[ngsHeadlessEditorRuns]',
  host: {
    'style': 'white-space: pre-wrap'
  }
})
export class NgsHeadlessEditorRuns {
  private readonly editor = inject(NgsHeadlessEditor);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly runs = input.required<readonly NgsHeadlessEditorText[]>({ alias: 'ngsHeadlessEditorRuns' });

  constructor() {
    effect(() => {
      const runs = this.runs();
      this.editor.plugins();
      renderNgsHeadlessEditorRuns(this.element, runs, this.editor);
    });
  }
}
