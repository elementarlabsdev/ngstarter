import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorDocument,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
  NGS_HEADLESS_EDITOR_TOGGLE_CODE,
  NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

interface MenuPosition {
  readonly top: number;
  readonly left: number;
}

@Component({
  selector: 'app-bubble-menu-example',
  imports: [Button, NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin()))],
  templateUrl: './bubble-menu-example.html',
  styleUrl: './bubble-menu-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BubbleMenuExample {
  readonly editor = inject(NgsHeadlessEditor);
  private readonly surface = viewChild.required(NgsHeadlessEditorSurface);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  readonly position = signal<MenuPosition | null>(null);
  readonly disabled = signal(false);
  readonly spellcheck = signal(true);
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;
  readonly italic = NGS_HEADLESS_EDITOR_TOGGLE_ITALIC;
  readonly code = NGS_HEADLESS_EDITOR_TOGGLE_CODE;
  private frame: number | null = null;

  constructor() {
    this.editor.setDocument(createNgsHeadlessEditorDocument(
      'Select any part of this sentence to open a floating formatting menu above the selection.'
    ));

    // Re-measure whenever the selection, focus or content changes. The DOM is read
    // in the next animation frame, after the surface has rendered the change.
    effect(() => {
      this.editor.selection();
      this.editor.focused();
      this.editor.revision();
      this.scheduleMeasure();
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.frame !== null) {
        cancelAnimationFrame(this.frame);
      }
    });
  }

  private scheduleMeasure(): void {
    if (typeof requestAnimationFrame === 'undefined') {
      return;
    }
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      // getSelectionRect() returns null for a collapsed caret or a selection outside the surface.
      const rect = this.editor.focused() ? this.surface().getSelectionRect() : null;
      if (!rect) {
        this.position.set(null);
        return;
      }
      const host = this.container().nativeElement.getBoundingClientRect();
      this.position.set({
        top: rect.top - host.top,
        left: rect.left - host.left + rect.width / 2
      });
    });
  }
}
