import {
  afterNextRender, Directive, effect, ElementRef, inject, input, OnDestroy, output, untracked
} from '@angular/core';
import {
  NgsHeadlessEditorInlineRegion, NgsHeadlessEditorSurface,
  NgsHeadlessEditorText, provideNgsHeadlessEditorInlineRegion
} from '@ngstarter-ui/components/headless-editor';
import { ContentBuilderStore } from './content-builder.store';
import { createNgsHeadlessEditorId } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorItemProperty, ContentEditorText } from './types';

const regions = new WeakMap<HTMLElement, ContentEditorContentEditableDirective>();

/** A headless inline editor bound to a text field in a content block. */
@Directive({
  selector: '[ngsContentEditorContentEditable]',
  exportAs: 'ngsContentEditorContentEditable',
  providers: [provideNgsHeadlessEditorInlineRegion()],
  hostDirectives: [NgsHeadlessEditorSurface],
  host: {
    'class': 'ngs-content-editor-content-editable',
    '[class.align-left]': 'alignment() === "left"',
    '[class.align-center]': 'alignment() === "center"',
    '[class.align-right]': 'alignment() === "right"',
    '[class.align-justify]': 'alignment() === "justify"',
    '(focus)': 'activate()'
  }
})
export class ContentEditorContentEditableDirective implements OnDestroy {
  readonly region = inject(NgsHeadlessEditorInlineRegion);
  private readonly surface = inject(NgsHeadlessEditorSurface);
  private readonly store = inject(ContentBuilderStore, { optional: true });
  private readonly historyGroup = createNgsHeadlessEditorId('content-region');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly content = input<ContentEditorText>([], { alias: 'ngsContentEditorContentEditable' });
  readonly settings = input<unknown>({});
  readonly props = input<ContentEditorItemProperty[]>([]);
  readonly singleLine = input(false);
  readonly contentChanged = output<readonly NgsHeadlessEditorText[]>();
  readonly propsChanged = output<ContentEditorItemProperty[]>();
  readonly pressedEnter = output<KeyboardEvent>();
  readonly initialized = output<void>();

  static forElement(element: HTMLElement | null): ContentEditorContentEditableDirective | undefined {
    return element ? regions.get(element) : undefined;
  }

  constructor() {
    regions.set(this.element, this);
    effect(() => {
      const content = this.content();
      untracked(() => this.region.load(content));
    });
    effect(() => {
      const content = this.region.content();
      const origin = this.region.editor.origin();
      if (origin !== 'external' && origin !== 'history') {
        untracked(() => {
          if (this.store) this.store.withTextEdit(origin, this.historyGroup, () => this.contentChanged.emit(content));
          else this.contentChanged.emit(content);
        });
      }
    });
    // Capture before the surface and the block's own listeners. Structural Enter
    // stays with the content builder; multiline fields use the headless surface.
    this.element.addEventListener('keydown', this.onKeydown, true);
    this.element.addEventListener('beforeinput', this.onBeforeInput, true);
    afterNextRender(() => this.initialized.emit());
  }

  activate(): void { this.region.activate(); }
  focus(): void { this.activate(); this.surface.focus(); }
  getContent(): readonly NgsHeadlessEditorText[] { return this.region.content(); }
  alignment(): string { return this.props().find(prop => prop.name === 'text-alignment')?.value ?? 'left'; }
  setAlignment(value: string): void {
    this.propsChanged.emit([
      ...this.props().filter(prop => prop.name !== 'text-alignment'),
      { name: 'text-alignment', value }
    ]);
  }
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && this.singleLine() && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.pressedEnter.emit(event);
    }
  };
  private readonly onBeforeInput = (event: InputEvent) => {
    if (event.inputType === 'insertParagraph' && this.singleLine() && !event.isComposing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.pressedEnter.emit(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
  };
  ngOnDestroy(): void {
    regions.delete(this.element);
    this.element.removeEventListener('keydown', this.onKeydown, true);
    this.element.removeEventListener('beforeinput', this.onBeforeInput, true);
  }
}
