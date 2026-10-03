import { NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { contentEditorText, cloneContentEditorValue } from '../../document';
import {
  ChangeDetectionStrategy,
  Component, effect, untracked,
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
  ContentEditorHeadingBlockSettings,
  ContentEditorItemProperty
} from '../../types';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';
import { CursorController } from '../../utils/cursor-controller';

@Component({
  selector: 'ngs-heading-block',
  imports: [
    ContentEditorContentEditableDirective
  ],
  templateUrl: './heading-block.component.html',
  styleUrl: './heading-block.component.scss',
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: HeadingBlockComponent,
      multi: true
    }
  ],
  host: {
    '[class.is-empty]': '_isEmpty()',
    '[class.level-1]': 'settings().level === 1',
    '[class.level-2]': 'settings().level === 2',
    '[class.level-3]': 'settings().level === 3',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadingBlockComponent implements OnInit, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _destroyRef = inject(DestroyRef);

  private _contentRef = viewChild.required<ElementRef<HTMLParagraphElement>>('contentRef');

  id = input.required<string>();
  content = input.required<readonly NgsHeadlessEditorText[]>();
  settings = input.required<ContentEditorHeadingBlockSettings>();
  props = input<ContentEditorItemProperty[]>([]);
  index = input.required<number>();
  placeholder = input('Heading');

  protected _content = signal<readonly NgsHeadlessEditorText[]>([])
  protected _isEmpty = signal<boolean>(true);
  protected _props = signal<ContentEditorItemProperty[]>([]);
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

  onPropsChanged(props: ContentEditorItemProperty[]) {
    this._props.set(props);
    this.update();
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
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
