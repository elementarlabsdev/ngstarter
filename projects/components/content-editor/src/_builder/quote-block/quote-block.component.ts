import { NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorText } from '../../types';
import { contentEditorText, cloneContentEditorValue } from '../../document';
import {
  ChangeDetectionStrategy,
  Component, computed, effect, untracked,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { ContentBuilderStore } from '../../content-builder.store';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK,
  ContentEditorDataBlock,
  ContentEditorItemProperty
} from '../../types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';

export interface ContentEditorQuoteBlockContent {
  cite: {
    content: ContentEditorText;
    props: ContentEditorItemProperty[];
  };
  caption?: {
    content: ContentEditorText;
    props: ContentEditorItemProperty[];
  }
}

export interface ContentEditorQuoteBlock {
  content: ContentEditorQuoteBlockContent,
  settings: any
}

@Component({
  selector: 'ngs-quote-block',
  exportAs: 'ngsQuoteBlock',
  imports: [
    ContentEditorContentEditableDirective,
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: QuoteBlockComponent,
      multi: true
    }
  ],
  templateUrl: './quote-block.component.html',
  styleUrl: './quote-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuoteBlockComponent implements OnInit, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _destroyRef = inject(DestroyRef);

  private _contentRef = viewChild.required<ElementRef<HTMLParagraphElement>>('contentRef');

  id = input.required<string>();
  content = input.required<ContentEditorQuoteBlockContent>();
  settings = input.required<any>();
  index = input.required<number>();
  props = input<ContentEditorItemProperty[]>([]);
  placeholder = input('Enter quote here');
  captionPlaceholder = input('Enter caption here');

  protected _citeContent = signal<ContentEditorText>([]);
  protected _citeProps = signal<ContentEditorItemProperty[]>([]);
  protected _captionContent = signal<ContentEditorText>([]);
  protected _captionProps = signal<ContentEditorItemProperty[]>([]);
  protected _isEmpty = signal<boolean>(true);
  readonly initialized = signal(false);

  citeOriginalContent = computed(() => {
    return this.content().cite.content || [];
  });
  citeOriginalProps = computed(() => {
    return this.content().cite.props || [];
  });
  captionOriginalContent = computed(() => {
    return this.content().caption?.content || [];
  });
  captionOriginalProps = computed(() => {
    return this.content().caption?.props || [];
  });

  constructor() {
    effect(() => {
      const content = this.content();
      untracked(() => {
        this._citeContent.set(content.cite.content);
        this._citeProps.set(cloneContentEditorValue(content.cite.props));
        this._captionContent.set(content.caption?.content ?? []);
        this._captionProps.set(cloneContentEditorValue(content.caption?.props ?? []));
        this._isEmpty.set(!contentEditorText(content.cite.content).trim());
      });
    });
  }

  ngOnInit() {
    this._citeContent.set(this.citeOriginalContent());
    this._citeProps.set(this.citeOriginalProps());
    this._captionContent.set(this.captionOriginalContent());
    this._captionProps.set(this.captionOriginalProps());
    this._isEmpty.set(this._citeContent().length === 0);
    this._contentBuilder
      .focusChanged
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (this._store.focusedBlockId() === this.id()) {
          this.focus();
        }
      });
  }

  focus() {
    const element = this._contentRef().nativeElement;
    const range = window.document.createRange();
    range.setStart(element, 0);
    range.setEnd(element, 0);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getData(): any {
    return {
      content: {
        cite: {
          content: this._citeContent(),
          props: this._citeProps(),
        },
        caption: {
          content: this._captionContent(),
          props: this._captionProps(),
        }
      },
      settings: {
        ...this.settings(),
      }
    };
  }

  isEmpty(): boolean {
    return !contentEditorText(this._citeContent()).trim();
  }

  protected onCiteContentChanged(content: readonly NgsHeadlessEditorText[]) {
    if (!this.initialized()) {
      return;
    }

    this._isEmpty.set(!contentEditorText(content).trim());
    this._citeContent.set(content);
    this.update();
  }

  protected onCaptionContentChanged(content: readonly NgsHeadlessEditorText[]) {
    if (!this.initialized()) {
      return;
    }

    this._captionContent.set(content);
    this.update();
  }

  protected onCitePropsChanged(props: ContentEditorItemProperty[]) {
    this._citeProps.set(props);
    this.update();
  }

  protected onCaptionPropsChanged(props: ContentEditorItemProperty[]) {
    this._captionProps.set(props);
    this.update();
  }

  protected onPressedEnter(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._contentBuilder.insertEmptyBlock(this.index());
  }

  protected onContentEditableInitialized() {
    if (this._store.focusedBlockId() === this.id()) {
      this.focus();
    }

    this.initialized.set(true);
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
