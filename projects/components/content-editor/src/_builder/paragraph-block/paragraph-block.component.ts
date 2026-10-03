import { NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { contentEditorText, cloneContentEditorValue } from '../../document';
import {
  ChangeDetectionStrategy,
  Component, effect, untracked, DestroyRef,
  ElementRef, forwardRef,
  inject,
  input,
  OnInit, signal,
  viewChild
} from '@angular/core';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK,
  ContentEditorDataBlock,
  ContentEditorItemProperty
} from '../../types';
import { ContentBuilderStore } from '../../content-builder.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CursorController } from '../../utils/cursor-controller';

@Component({
  selector: 'ngs-paragraph-block',
  imports: [
    ContentEditorContentEditableDirective
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: forwardRef(() => ParagraphBlockComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paragraph-block.component.html',
  styleUrl: './paragraph-block.component.scss',
  host: {
    'class': 'ngs-paragraph-block',
    '[class.is-empty]': '_isEmpty()'
  }
})
export class ParagraphBlockComponent implements OnInit, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _destroyRef = inject(DestroyRef);

  private _contentRef = viewChild.required<ElementRef<HTMLParagraphElement>>('contentRef');

  id = input.required<string>();
  content = input.required<readonly NgsHeadlessEditorText[]>();
  settings = input.required<any>();
  props = input<ContentEditorItemProperty[]>([]);
  index = input.required<number>();
  placeholder = input('Enter text here');

  protected _content = signal<readonly NgsHeadlessEditorText[]>([]);
  protected _props = signal<ContentEditorItemProperty[]>([]);
  protected _isEmpty = signal<boolean>(true);
  readonly initialized = signal(false);

  constructor() {
    effect(() => {
      const content = this.content();
      const props = this.props();
      untracked(() => {
        this._content.set(content);
        this._props.set(cloneContentEditorValue(props));
        this._isEmpty.set(!contentEditorText(content).trim());
      });
    });
  }

  ngOnInit() {
    this._content.set(this.content());
    this._props.set(this.props());
    this._isEmpty.set(!contentEditorText(this.content()).trim());
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
    const cursorController = new CursorController(element);
    cursorController.setToEnd();
  }

  getData(): any {
    return {
      content: this._content(),
      props: this._props(),
      settings: {
        ...this.settings(),
      }
    };
  }

  isEmpty(): boolean {
    return !contentEditorText(this._content()).trim();
  }

  protected onContentChanged(content: readonly NgsHeadlessEditorText[]) {
    if (!this.initialized()) {
      return;
    }

    this._content.set(content);
    this._isEmpty.set(!contentEditorText(content).trim());

    this.update();
  }

  protected onPropsChanged(props: ContentEditorItemProperty[]) {
    this._props.set(props);
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

  protected _onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace' && !contentEditorText(this._content())) {
      this._contentBuilder.deleteBlock(this.id());
    }
  }

  private update() {
    this._contentBuilder.updateParagraph(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
