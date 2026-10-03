import { NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { contentEditorText, cloneContentEditorValue } from '../../document';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, effect, untracked,
  DestroyRef,
  ElementRef,
  inject,
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
import { NgTemplateOutlet } from '@angular/common';
import { ContentObserverDirective } from '../../content-observer.directive';
import { CursorController } from '../../utils/cursor-controller';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';

@Component({
  selector: 'ngs-list-block',
  exportAs: 'ngsListBlock',
  imports: [
    ContentEditorContentEditableDirective,
    NgTemplateOutlet,
    ContentObserverDirective
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
    level: number,
    parentItem: ContentEditorListItem | null,
    parentList: ContentEditorListItem[]
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (level === 0) {
      const content = contentEditable.getContent();

      if (contentEditorText(content)) {
        list.splice(index + 1, 0, {
          content: [],
          props: [],
          styles: {},
          children: []
        });
      } else {
        list.splice(index, 1);

        if (list.length === 0) {
          this._contentBuilder.deleteBlock(this.id());
        }

        this._contentBuilder.insertEmptyBlock(this.index());
      }
    } else {
      if (list[index] && !contentEditorText(list[index].content)) {
        list.splice(index, 1);
        const parentIndex = parentList.findIndex(item => item === parentItem);
        parentList.splice(parentIndex + 1, 0, {
          content: [],
          props: [],
          children: []
        });
      } else {
        list.splice(index + 1, 0, {
          content: [],
          props: [],
          styles: {},
          children: []
        });
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

  protected _onNodeAdded(node: HTMLElement) {
    this._focusItem(node.querySelector('.list-item-content') as HTMLElement);
  }

  protected _focusItem(element: HTMLElement) {
    const cursorController = new CursorController(element);
    cursorController.setToEnd();
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
      const latestElementInParentList = (listItem.closest('.list') as HTMLElement)?.parentNode;
      list.splice(index, 1);
      const prevElement = listItem.previousSibling as HTMLElement;

      if (prevElement) {
        this._focusItem(prevElement.querySelector('.list-item-content') as HTMLElement);
      } else {
        if (latestElementInParentList) {
          this._focusItem(latestElementInParentList.querySelector('.list-item-content') as HTMLElement);
        }
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();

      if (event.shiftKey && parentItem) {
        const cached = JSON.parse(JSON.stringify(list[index]));
        list.splice(index, 1);
        const parentIndex = parentList.findIndex(item => item === parentItem);
        parentList.splice(parentIndex + 1, 0, cached);
      } else {
        if (list[index - 1]) {
          const cached = JSON.parse(JSON.stringify(list[index]));
          list.splice(index, 1);
          list[index - 1].children.push(cached);
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
