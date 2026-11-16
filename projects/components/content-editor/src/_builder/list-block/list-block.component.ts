import { NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { contentEditorText, cloneContentEditorValue } from '../../document';
import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, effect, untracked,
  ElementRef,
  inject,
  Injector,
  input,
  OnInit,
  signal
} from '@angular/core';
import { ContentBuilderStore } from '../../content-builder.store';
import {
  CONTENT_BUILDER, CONTENT_EDITOR_BLOCK,
  ContentEditorDataBlock,
  ContentEditorItemProperty,
  ContentEditorListItem,
  ContentEditorListSettings
} from '../../types';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { CursorController } from '../../utils/cursor-controller';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';

@Component({
  selector: 'ngs-list-block',
  exportAs: 'ngsListBlock',
  imports: [
    ContentEditorContentEditableDirective,
    NgTemplateOutlet
  ],
  templateUrl: './list-block.component.html',
  styleUrl: './list-block.component.scss',
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: ListBlockComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.list-bullet]': "_listStyle() === 'bullet'",
    '[class.list-ordered]': "_listStyle() === 'ordered'",
  }
})
export class ListBlockComponent implements OnInit, ContentEditorDataBlock, AfterViewInit {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  id = input.required<string>();
  content = input.required<ContentEditorListItem[]>();
  settings = input.required<ContentEditorListSettings>();
  index = input.required<number>();
  props = input<ContentEditorItemProperty[]>([]);

  protected _placeholder = signal<string>('List item');
  protected _content = signal<ContentEditorListItem[]>([
    {
      content: [],
      props: [],
      children: []
    }
  ]);
  protected _listStyle = signal('');
  readonly initialized = signal(false);

  constructor() {
    effect(() => {
      const content = this.content();
      const settings = this.settings();
      untracked(() => {
        this._content.set(cloneContentEditorValue(content.length ? content : [{ content: [], props: [], children: [] }]));
        this._listStyle.set(settings.listStyle);
      });
    });
    afterNextRender(() => {
      if (this._store.focusedBlockId() === this.id()) this.focus();
    });
  }

  ngOnInit() {
    this._listStyle.set(this.settings().listStyle);

    if (this.content().length !== 0) {
      this._content.set(cloneContentEditorValue(this.content()));
    }
  }

  ngAfterViewInit() {
    this.initialized.set(true);
  }

  focus() {
    this.focusItem(this.element.querySelector(':scope > .list > .list-item'));
  }

  protected onContentChanged(content: readonly NgsHeadlessEditorText[], list: ContentEditorListItem[], index: number) {
    if (!list[index]) {
      return;
    }

    list[index].content = content;
    this.update();
  }

  protected onPressedEnter(
    event: KeyboardEvent,
    contentEditable: ContentEditorContentEditableDirective,
    list: ContentEditorListItem[],
    index: number,
    parentItem: ContentEditorListItem | null,
    parentList: ContentEditorListItem[],
    listItem: HTMLElement
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (contentEditorText(contentEditable.getContent())) {
      list.splice(index + 1, 0, { content: [], props: [], styles: {}, children: [] });
      this.focusAfterEdit(listItem, () => listItem.nextElementSibling);
    } else {
      list.splice(index, 1);
      if (parentItem) {
        const parentIndex = parentList.findIndex(item => item === parentItem);
        const parentElement = listItem.parentElement?.parentElement;
        parentList.splice(parentIndex + 1, 0, { content: [], props: [], children: [] });
        this.focusAfterEdit(listItem, () => parentElement?.nextElementSibling ?? null);
      } else {
        if (list.length === 0) this._contentBuilder.deleteBlock(this.id());
        this._contentBuilder.insertEmptyBlock(this.index());
      }
    }

    this.update();
  }

  getId(level: number, index: number): string {
    return 'item-level-' + (level + index + 2).toString();
  }

  getData(): any {
    return {
      content: this._content(),
      settings: {
        ...this.settings(),
      }
    };
  }

  isEmpty(): boolean {
    return !this._content().some(item => contentEditorText(item.content).trim() || item.children.length > 0);
  }

  private focusAfterEdit(origin: HTMLElement, target: () => Element | null): void {
    afterNextRender(() => {
      const active = this.document.activeElement;
      if (origin.contains(active) || (!origin.isConnected && active === this.document.body)) {
        this.focusItem(target());
      }
    }, { injector: this.injector });
  }

  private focusItem(item: Element | null): void {
    const element = item?.querySelector<HTMLElement>(':scope > .list-item-content');
    if (element) new CursorController(element).setToEnd();
  }

  protected _onKeyDown(
    event: KeyboardEvent,
    contentEditable: ContentEditorContentEditableDirective,
    list: ContentEditorListItem[],
    index: number,
    level: number,
    parentItem: ContentEditorListItem | null,
    parentList: ContentEditorListItem[],
    listItem: HTMLElement
  ) {
    if (event.key === 'Backspace' && !contentEditorText(contentEditable.getContent())) {
      const parentElement = parentItem ? listItem.parentElement?.parentElement : null;
      const previous = listItem.previousElementSibling ?? parentElement ?? null;
      list.splice(index, 1);
      this.focusAfterEdit(listItem, () => previous);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();

      if (event.shiftKey && parentItem) {
        const parentElement = listItem.parentElement?.parentElement;
        const cached = JSON.parse(JSON.stringify(list[index]));
        list.splice(index, 1);
        const parentIndex = parentList.findIndex(item => item === parentItem);
        parentList.splice(parentIndex + 1, 0, cached);
        this.focusAfterEdit(listItem, () => parentElement?.nextElementSibling ?? null);
      } else {
        if (list[index - 1]) {
          const previous = listItem.previousElementSibling;
          const cached = JSON.parse(JSON.stringify(list[index]));
          list.splice(index, 1);
          list[index - 1].children.push(cached);
          this.focusAfterEdit(listItem, () => previous?.querySelector(':scope > .list > .list-item:last-child') ?? null);
        }
      }
    }

    if (level === 0 && list.length === 0) {
      this._contentBuilder.deleteBlock(this.id());
    }

    this.update();
  }

  onPropsChanged(props: ContentEditorItemProperty[], item: any) {
    item.props = props;
    this.update();
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
