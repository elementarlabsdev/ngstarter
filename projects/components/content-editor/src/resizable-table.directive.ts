import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  NgZone,
  Input,
  AfterViewInit,
  output, inject, PLATFORM_ID
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';

const RESIZING_TABLE_CLASS = 'table-resizing';
const RESIZE_HANDLE_ACTIVE_CLASS = 'resize-handle--active';

@Directive({
  selector: 'table[ngsResizableTable]'
})
export class ResizableTableDirective implements OnInit, AfterViewInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);

  @Input() minColumnWidth = 120;
  @Input() resizeHandleWidth = 5;
  @Input() mutationObserverDebounceTime = 20;

  readonly columnWidthChange = output<{columnIndex: number, width: number}>();
  readonly columnWidthChangeStart = output<void>();
  readonly columnWidthChangeEnd = output<void>();

  private table: HTMLTableElement;
  private wrapper: HTMLDivElement | null = null;
  private resizeHandle: HTMLDivElement | null = null;
  private colgroup: HTMLTableColElement | null = null;
  private colElements: HTMLTableColElement[] = [];

  private isResizing = false;
  private resizingColumnIndex = -1;
  private resizingColElement: HTMLTableColElement | null = null;
  private startX = 0;
  private startWidth = 0;
  private startEdgeXRelative = 0;

  private activeHoverColumnIndex = -1;
  private isHandleVisible = false;

  private destroy$ = new Subject<void>();
  private hideHandleDebounced: () => void;
  private syncColumnsDebounced: () => void; // Debounce для синхронизации колонок

  private listeners: (() => void)[] = [];
  private observer: MutationObserver | null = null;

  constructor(
    private el: ElementRef<HTMLTableElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.table = this.el.nativeElement;
    this.hideHandleDebounced = this.debounce(() => this.hideResizeHandle(), 50);
    this.syncColumnsDebounced = this.debounce(() => {
      this.syncColumnsAndColgroup();
      this.ensureColWidths();

      if (this.isHandleVisible) {
        this.hideResizeHandle();
      }
    }, this.mutationObserverDebounceTime);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    this.checkTableLayout();
    this.createWrapperAndHandle();
    this.syncColumnsAndColgroup();

    if (!this.wrapper || !this.resizeHandle) {
      console.error('ResizableTableDirective: Wrapper or handle creation failed.');
      this.cleanupWrapperAndHandleOnError();
      return;
    }

    this.addWrapperListeners();
    this.setupGlobalResizeListeners();
    this.setupMutationObserver();
    this.ensureColWidths();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
    this.listeners.forEach(unlisten => unlisten());
    this.cleanupWrapperAndHandle();
  }

  private checkTableLayout(): void { /* ... как раньше ... */
    if (getComputedStyle(this.table).tableLayout !== 'fixed') {
      console.warn('ResizableTableDirective: table-layout: fixed is highly recommended.');
      this.renderer.setStyle(this.table, 'table-layout', 'fixed');
    }
  }

  private syncColumnsAndColgroup(): void {
    let requiredColumnCount = 0;
    const firstDataRow = this.table.querySelector('tbody > tr:first-child') as HTMLTableRowElement | null;

    if (firstDataRow) {
      requiredColumnCount = firstDataRow.cells.length;
    } else {
      // Если tbody пуст, можно попробовать определить по thead, если он есть
      const firstHeadRow = this.table.querySelector('thead > tr:first-child') as HTMLTableRowElement | null;

      if (firstHeadRow) {
        requiredColumnCount = firstHeadRow.cells.length;
      } else {
        if(this.colgroup) {
          this.colElements.forEach(col => this.renderer.removeChild(this.colgroup, col));
        }

        this.colElements = [];
        return;
      }
    }

    this.colgroup = this.table.querySelector('colgroup') as HTMLTableColElement;

    const currentColElements = Array.from(this.colgroup.querySelectorAll('col'));
    const currentColCount = currentColElements.length;

    if (requiredColumnCount > currentColCount) {
      for (let i = currentColCount; i < requiredColumnCount; i++) {
        const col = this.renderer.createElement('col');
        this.renderer.appendChild(this.colgroup, col);
      }
    }

    else if (requiredColumnCount < currentColCount) {
      for (let i = currentColCount - 1; i >= requiredColumnCount; i--) {
        this.renderer.removeChild(this.colgroup, currentColElements[i]);
      }
    }

    this.colElements = Array.from(this.colgroup.querySelectorAll('col'));
  }

  private ensureColWidths(): void {
    const referenceRow = this.table.querySelector('tbody > tr:first-child, thead > tr:first-child') as HTMLTableRowElement | null;

    if (!referenceRow || this.colElements.length !== referenceRow.cells.length) {
      return;
    }

    this.colElements.forEach((col, index) => {
      if (!col.style.width && referenceRow.cells[index]) {
        const cellWidth = referenceRow.cells[index].getBoundingClientRect().width;

        if (cellWidth > 0) {
          this.renderer.setStyle(col, 'width', `${cellWidth}px`);
        }
      }
    });
  }

  private setupMutationObserver(): void {
    const targetNode = this.table.querySelector('tbody') ?? this.table;

    const config: MutationObserverInit = {
      childList: true,
      subtree: true
    };

    const callback: MutationCallback = (mutationsList, observer) => {
      this.ngZone.runOutsideAngular(() => {
        this.syncColumnsDebounced();
      });
    };
    this.observer = new MutationObserver(callback);
    this.observer.observe(targetNode, config);
  }

  private createWrapperAndHandle(): void {
    this.wrapper = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapper, 'resizable-table-wrapper');
    this.resizeHandle = this.renderer.createElement('div');
    this.renderer.addClass(this.resizeHandle, 'resizable-table-handle');
    this.renderer.setStyle(this.resizeHandle, 'width', `${this.resizeHandleWidth}px`);

    const parent = this.renderer.parentNode(this.table);

    if (parent) {
      this.renderer.insertBefore(parent, this.wrapper, this.table);
      this.renderer.appendChild(this.wrapper, this.table);
      this.renderer.appendChild(this.wrapper, this.resizeHandle);
    } else {
      console.error('ResizableTableDirective: Table has no parent node.');
      this.wrapper = null; this.resizeHandle = null;
    }
  }

  private cleanupWrapperAndHandle(): void {
    if (this.wrapper && this.wrapper.parentNode) {
      if (this.table.parentNode === this.wrapper) {
        this.renderer.insertBefore(this.wrapper.parentNode, this.table, this.wrapper);
      }
      this.renderer.removeChild(this.wrapper.parentNode, this.wrapper);
    } else if (this.resizeHandle && this.resizeHandle.parentNode) {
      this.renderer.removeChild(this.resizeHandle.parentNode, this.resizeHandle);
    }
    this.wrapper = null;
    this.resizeHandle = null;
  }

  private cleanupWrapperAndHandleOnError(): void { /* ... как раньше ... */
    if (this.wrapper && this.table.parentNode === this.wrapper) {
      const parent = this.wrapper.parentNode;
      if(parent) {
        this.renderer.insertBefore(parent, this.table, this.wrapper);
        this.renderer.removeChild(parent, this.wrapper);
      }
    }
    this.wrapper = null;
    this.resizeHandle = null;
  }

  private addWrapperListeners(): void {
    if (!this.wrapper) return;
    this.ngZone.runOutsideAngular(() => {
      const mm = this.renderer.listen(this.wrapper, 'mousemove', (e: MouseEvent) => this.handleMouseMoveWrapper(e));
      this.listeners.push(mm);
    });
    const md = this.renderer.listen(this.wrapper, 'mousedown', (e: MouseEvent) => this.handleMouseDownWrapper(e));
    const ml = this.renderer.listen(this.wrapper, 'mouseleave', (e: MouseEvent) => { if (!this.isResizing) this.hideResizeHandle(); });
    this.listeners.push(md, ml);
  }

  private handleMouseMoveWrapper(event: MouseEvent): void {
    if (this.isResizing || !this.wrapper) {
      return;
    }

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const mouseXRelative = event.clientX - wrapperRect.left;
    let targetColumnIndex = -1;
    let edgeXPosition = 0;

    const firstRow = this.table.querySelector('tbody > tr:first-child, thead > tr:first-child') as HTMLTableRowElement | null;

    if (!firstRow) {
      return;
    }

    if (this.colElements.length !== firstRow.cells.length) {
      return;
    }

    for (let i = 0; i < firstRow.cells.length; i++) {
      const cell = firstRow.cells[i];

      if (!cell) {
        continue;
      }

      const cellRect = cell.getBoundingClientRect();
      const cellEdgeX = cellRect.right - wrapperRect.left;

      if (Math.abs(mouseXRelative - cellEdgeX) <= this.resizeHandleWidth / 2) {
        if (this.colElements[i]) {
          targetColumnIndex = i;
          edgeXPosition = cellEdgeX;
          break;
        }
      }
    }

    if (targetColumnIndex !== -1) {
      this.showResizeHandle(edgeXPosition);
      this.activeHoverColumnIndex = targetColumnIndex;
    } else {
      this.hideHandleDebounced();
    }
  }

  private handleMouseDownWrapper(event: MouseEvent): void {
    if (this.activeHoverColumnIndex !== -1 && this.isHandleVisible && this.wrapper) {
      const targetCol = this.colElements[this.activeHoverColumnIndex];
      const firstRow = this.table.querySelector('tbody > tr:first-child, thead > tr:first-child') as HTMLTableRowElement | null;

      if (!targetCol || !firstRow || !firstRow.cells[this.activeHoverColumnIndex]) {
        return;
      }

      this.isResizing = true;
      this.resizingColumnIndex = this.activeHoverColumnIndex;
      this.resizingColElement = targetCol;
      this.startX = event.clientX;

      const colStyleWidth = this.resizingColElement.style.width;
      this.startWidth = colStyleWidth && colStyleWidth.endsWith('px')
        ? parseFloat(colStyleWidth)
        : this.resizingColElement.getBoundingClientRect().width;

      if (this.startWidth <= 0 ) {
        this.startWidth = firstRow.cells[this.resizingColumnIndex].getBoundingClientRect().width;
      }

      const wrapperRect = this.wrapper.getBoundingClientRect();
      const cellRect = firstRow.cells[this.resizingColumnIndex].getBoundingClientRect();
      this.startEdgeXRelative = cellRect.right - wrapperRect.left;

      this.renderer.addClass(this.table, RESIZING_TABLE_CLASS);
      event.preventDefault();
      this.columnWidthChangeStart.emit();
    }
  }

  private showResizeHandle(edgeX: number): void {
    if (!this.resizeHandle || !this.wrapper) {
      return;
    }

    const handleLeft = edgeX - (this.resizeHandleWidth / 2);
    this.renderer.setStyle(this.resizeHandle, 'left', `${handleLeft}px`);
    this.renderer.setStyle(this.resizeHandle, 'top', `${this.table.offsetTop}px`);
    this.renderer.setStyle(this.resizeHandle, 'height', `${this.table.offsetHeight}px`);
    this.renderer.addClass(this.resizeHandle, RESIZE_HANDLE_ACTIVE_CLASS);
    this.isHandleVisible = true;
  }

  private hideResizeHandle(): void {
    if (this.resizeHandle && this.isHandleVisible) {
      this.renderer.removeClass(this.resizeHandle, RESIZE_HANDLE_ACTIVE_CLASS);
      this.isHandleVisible = false;
      this.activeHoverColumnIndex = -1;
    }
  }

  private debounce(func: (...args: any[]) => void, wait: number): (...args: any[]) => void {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  private setupGlobalResizeListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent<MouseEvent>(document, 'mousemove')
        .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          if (!this.isResizing || !this.resizingColElement || !this.wrapper || !this.resizeHandle) return;

          if (!this.resizingColElement.parentElement) {
            this.stopResizing();
            return;
          }

          const deltaX = event.clientX - this.startX;
          const newWidth = this.startWidth + deltaX;
          const finalWidth = Math.max(newWidth, this.minColumnWidth);
          this.renderer.setStyle(this.resizingColElement, 'width', `${finalWidth}px`);
          const actualDeltaX = finalWidth - this.startWidth;
          const newEdgeXRelative = this.startEdgeXRelative + actualDeltaX;
          const handleLeft = newEdgeXRelative - (this.resizeHandleWidth / 2);
          this.renderer.setStyle(this.resizeHandle, 'left', `${handleLeft}px`);

          if (!this.isHandleVisible) {
            this.renderer.addClass(this.resizeHandle, RESIZE_HANDLE_ACTIVE_CLASS);
            this.isHandleVisible = true;
          }

          this.updateHandleHeight();
        });

      fromEvent<MouseEvent>(document, 'mouseup')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.isResizing) {
            this.ngZone.run(() => {
              this.stopResizing();
            });
          }
        });
    });
  }

  private stopResizing(): void {
    this.columnWidthChange.emit({
      columnIndex: this.resizingColumnIndex,
      width: this.resizingColElement?.getBoundingClientRect().width as number
    });
    this.renderer.removeClass(this.table, RESIZING_TABLE_CLASS);
    this.hideResizeHandle();
    this.isResizing = false;
    this.resizingColumnIndex = -1;
    this.resizingColElement = null;
    this.columnWidthChangeEnd.emit();
  }

  private updateHandleHeight(): void {
    if (this.resizeHandle && this.isHandleVisible && this.wrapper) {
      requestAnimationFrame(() => {
        if(this.isHandleVisible && this.resizeHandle && this.table) {
          this.renderer.setStyle(this.resizeHandle, 'top', `${this.table.offsetTop}px`);
          this.renderer.setStyle(this.resizeHandle, 'height', `${this.table.offsetHeight}px`);
        }
      });
    }
  }
}
