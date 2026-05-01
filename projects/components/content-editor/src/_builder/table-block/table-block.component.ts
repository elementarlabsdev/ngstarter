import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input, OnInit, PLATFORM_ID, signal,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK,
  ContentEditorDataBlock,
  ContentEditorTableBlockSettings
} from '../../types';
import { ContentEditorContentEditableDirective } from '../../content-editor-content-editable.directive';
import SelectionArea from '@viselect/vanilla';
import { Icon } from '@ngstarter/components/icon';
import { TableColumnsManagerDirective } from '../../table-columns-manager.directive';
import { TableRowsManagerDirective } from '../../table-rows-manager.directive';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { ResizableTableDirective } from '../../resizable-table.directive';
import { DraggableTableComponent } from '../../draggable-table/draggable-table.component';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentBuilderStore } from '../../content-builder.store';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';

@Component({
  selector: 'ngs-table-block',
  imports: [
    ContentEditorContentEditableDirective,
    Icon,
    TableColumnsManagerDirective,
    TableRowsManagerDirective,
    CdkMonitorFocus,
    ResizableTableDirective,
    DraggableTableComponent
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: TableBlockComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-block.component.html',
  styleUrl: './table-block.component.scss',
  host: {
    '[class.is-column-managing]': '_columnManaging()',
    '[class.is-row-managing]': '_rowManaging()',
  }
})
export class TableBlockComponent implements OnInit, AfterViewInit, ContentEditorDataBlock {
  private _platformId = inject(PLATFORM_ID);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _store = inject(ContentBuilderStore);
  private _cdr = inject(ChangeDetectorRef);
  private _tableRef = viewChild.required<ElementRef>('table');

  id = input.required<string>();
  content = input.required<any[]>();
  settings = input.required<ContentEditorTableBlockSettings>();
  index = input.required<number>();

  _content = signal<any[]>([]);
  _columnManaging = signal(false);
  _rowManaging = signal(false);
  _tableManging = signal(false);
  _resizeManging = signal(false);
  readonly initialized = signal(false);

  ngOnInit() {
    this._content.set(this.content());
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this._platformId)) {
      const selection = new SelectionArea({
        selectables: ['.table td'],
        boundaries: ['.table'],
        features: {
          touch: true,
          range: true,
          deselectOnBlur: true,
          singleTap: {
            allow: false,
            intersect: 'native'
          }
        }
      }).on('start', ({ store, event }: any) => {
        if (!event.ctrlKey && !event.metaKey) {
          store.stored.forEach((el: any) => el.classList.remove('selected'));
          selection.clearSelection();
        }
      })
      .on('move', ({ store: { changed: { added, removed } } }) => {
        if (this._tableManging() || this._columnManaging() || this._rowManaging()) {
          return;
        }

        added.forEach(el => el.classList.add('selected'));
        removed.forEach(el => el.classList.remove('selected'));
      });
    }
    this.initialized.set(true);
  }

  focus() {

  }

  onTableFocusChange(type: any) {
    if (type === null) {
      this.clearCellsSelection();
    }
  }

  clearCellsSelection() {
    this._tableRef().nativeElement.querySelectorAll('td')
      .forEach((el: any) => el.classList.remove('selected'))
    ;
    this.update();
  }

  onColAdded() {
    this._content.update((content: any[]) => {
      content.forEach((row: any) => {
        row.push({
          content: '',
          props: [],
          styles: {},
          options: {
            colspan: 1,
            rowspan: 1
          }
        });
      });
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onColDeleted() {
    if (this._content().length > 0 && this._content()[0].length === 1) {
      return;
    }

    let isLastColEmpty = false;

    this._content().forEach((row: any) => {
      if (row[row.length - 1].content) {
        isLastColEmpty = true;
      }
    });

    if (isLastColEmpty) {
      return;
    }

    this._content.update((content: any[]) => {
      content.forEach((row: any) => {
        row.splice(row.length - 1, 1);
      });
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onRowAdded() {
    this._content.update((content: any[]) => {
      const row: any[] = [];

      for (let i = 0; i < content[0].length; i++) {
        row.push({
          content: '',
          props: [],
          styles: {},
          options: {
            colspan: 1,
            rowspan: 1
          }
        });
      }

      content.push(row);
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onRowDeleted() {
    if (this._content().length === 1) {
      return;
    }

    let isLastRowEmpty = false;

    this._content()[this._content().length - 1].forEach((cell: any) => {
      if (cell.content) {
        isLastRowEmpty = true;
      }
    });

    if (isLastRowEmpty) {
      return;
    }

    this._content.update((content: any[]) => {
      content.splice(content.length - 1, 1);
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onColumnManagingStart() {
    this._columnManaging.set(true);
  }

  onColumnManagingEnd() {
    this._columnManaging.set(false);
  }

  onRowManagingStart() {
    this._rowManaging.set(true);
  }

  onRowManagingEnd() {
    this._rowManaging.set(false);
  }

  onColumnWidthChange(event: any) {
    this._content.update((content: any[]) => {
      content.forEach(row => {
        row[event.columnIndex].options['width'] = event.width;
      })
      return content;
    });
    this.update();
  }

  onColumnMoved(event: any) {
    this._content.update((content: any[]) => {
      content.forEach(row => {
        moveItemInArray(row, event.startElementIndex, event.finalTargetIndex);
      });
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onRowMoved(event: any) {
    this._content.update((content: any[]) => {
      moveItemInArray(content, event.startElementIndex, event.finalTargetIndex);
      return content;
    });
    this._cdr.markForCheck();
    this.update();
  }

  onMoveStart() {
    this._tableManging.set(true);
  }

  onMoveEnd() {
    this._tableManging.set(false);
  }

  onColumnWidthChangeStart() {
    this._tableManging.set(true);
    this._resizeManging.set(true);
  }

  onColumnWidthChangeEnd() {
    this._tableManging.set(false);
    this._resizeManging.set(false);
    this._cdr.markForCheck();
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
    return false;
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
