import {
  Component,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  AfterViewInit,
  NgZone,
  ChangeDetectionStrategy,
  inject,
  HostBinding,
  output,
  input,
  booleanAttribute,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CONTENT_BUILDER } from '../types';
import { ContentBuilderComponent } from '../content-builder/content-builder.component';
import { Subscription, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const HIDE_DELAY_MS = 300;

interface ColumnInfo {
  index: number;
  left: number;
  width: number;
  center: number;
}

interface RowInfo {
  index: number;
  element: HTMLTableRowElement;
  top: number;
  height: number;
  center: number;
}

@Component({
  selector: 'ngs-draggable-table',
  exportAs: 'ngsDraggableTable',
  imports: [],
  templateUrl: './draggable-table.component.html',
  styleUrl: './draggable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.disabled]': 'disabled() || null'
  }
})
export class DraggableTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  private _platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);
  private table: HTMLTableElement | null = null;
  private suppressInteractions = false;
  private columnHandler!: HTMLElement;
  private rowHandler!: HTMLElement;
  private dropIndicator!: HTMLElement;
  private hoveredCell: HTMLElement | null = null;
  private hoveredColumnIndex: number = -1;
  private hoveredRowIndex: number = -1;
  private isDragging = false;
  private dragMode: 'row' | 'column' | null = null;
  private startX = 0;
  private startY = 0;
  private handlerStartY = 0;
  private draggedElement: HTMLElement | null = null;
  private draggedElementSource: HTMLElement | null = null;
  private startElementIndex = -1;
  private currentDropIndex = -1;
  private hideTimeoutId: any = null;
  private columnInfo: ColumnInfo[] = [];
  private rowInfo: RowInfo[] = [];
  private listeners: {
    name: string;
    type: 'element' | 'document';
    target?: () => EventTarget | null;
    event: string;
    handler: (event: any) => void;
    cleanup?: () => void
  }[] = [];
  private boundOnDrag: (event: MouseEvent) => void;
  private boundEndDrag: (event: MouseEvent) => void;
  private handlerSize = 18;
  private handlerOffset = -9;
  private indicatorThickness = 3;
  private suppressResetTimeoutId: any = null;
  private scrollContainerRef: Element | Window | null = null; // Kept for backward compatibility; not used directly
  private scrollSub: Subscription | null = null;
  @HostBinding('class.draggable-table-host') hostClass = true;

  disabled = input(false, {
    transform: booleanAttribute
  });

  readonly columnMoved = output<{ startElementIndex: number, finalTargetIndex: number }>();
  readonly rowMoved = output<{ startElementIndex: number, finalTargetIndex: number }>();
  readonly moveStart = output<void>();
  readonly moveEnd = output<void>();

  constructor() {
    this.boundOnDrag = this.onDrag.bind(this);
    this.boundEndDrag = this.endDrag.bind(this);
  }

  ngOnInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    this.createHandlers();
    this.createDropIndicator();
    this.prepareListeners();
  }

  ngAfterViewInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    this.table = this.elRef.nativeElement.querySelector('table');
    if (!this.table) {
      return;
    }
    if (getComputedStyle(this.table).position === 'static') {
      this.renderer.setStyle(this.table, 'position', 'relative');
    }
    this.renderer.appendChild(this.table, this.columnHandler);
    this.renderer.appendChild(this.table, this.rowHandler);
    this.renderer.appendChild(this.table, this.dropIndicator);
    this.attachListeners('element');
    this.bindScrollContainerListener();
  }

  ngOnDestroy(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    this.unbindScrollContainerListener();
    this.detachListeners('all');
    this.cancelHideTimer();
    if (this.suppressResetTimeoutId) {
      clearTimeout(this.suppressResetTimeoutId);
      this.suppressResetTimeoutId = null;
    }
    if (this.dropIndicator?.parentNode) {
      this.renderer.removeChild(this.dropIndicator.parentNode, this.dropIndicator);
    }
    if (this.columnHandler?.parentNode) {
      this.renderer.removeChild(this.columnHandler.parentNode, this.columnHandler);
    }
    if (this.rowHandler?.parentNode) {
      this.renderer.removeChild(this.rowHandler.parentNode, this.rowHandler);
    }
    if (this.table) {
      this.renderer.removeClass(this.table, 'dragging-column');
      this.renderer.removeClass(this.table, 'dragging-row');
      this.table.querySelectorAll('.dragging-source').forEach(el => this.renderer.removeClass(el, 'dragging-source'));
      this.table.querySelectorAll('.col-highlight').forEach(el => this.renderer.removeClass(el, 'col-highlight'));
    }
    document.body.style.cursor = '';
    this.columnInfo = [];
    this.rowInfo = [];
    this.currentDropIndex = -1;
    this.suppressInteractions = false;
  }

  private prepareListeners(): void {
    this.listeners = [
      {
        name: 'tableMouseOver',
        type: 'element',
        target: () => this.table,
        event: 'mouseover',
        handler: this.onTableMouseOver.bind(this)
      },
      {
        name: 'tableMouseLeave',
        type: 'element',
        target: () => this.table,
        event: 'mouseleave',
        handler: this.onTableMouseLeave.bind(this)
      },
      {
        name: 'colHandlerMouseDown',
        type: 'element',
        target: () => this.columnHandler,
        event: 'mousedown',
        handler: (e: MouseEvent) => this.onHandlerMouseDown(e, 'column')
      },
      {
        name: 'colHandlerMouseEnter',
        type: 'element',
        target: () => this.columnHandler,
        event: 'mouseenter',
        handler: this.onHandlerMouseEnter.bind(this)
      },
      {
        name: 'colHandlerMouseLeave',
        type: 'element',
        target: () => this.columnHandler,
        event: 'mouseleave',
        handler: this.onHandlerMouseLeave.bind(this)
      },
      {
        name: 'rowHandlerMouseDown',
        type: 'element',
        target: () => this.rowHandler,
        event: 'mousedown',
        handler: (e: MouseEvent) => this.onHandlerMouseDown(e, 'row')
      },
      {
        name: 'rowHandlerMouseEnter',
        type: 'element',
        target: () => this.rowHandler,
        event: 'mouseenter',
        handler: this.onHandlerMouseEnter.bind(this)
      },
      {
        name: 'rowHandlerMouseLeave',
        type: 'element',
        target: () => this.rowHandler,
        event: 'mouseleave',
        handler: this.onHandlerMouseLeave.bind(this)
      },
      {name: 'docMouseMove', type: 'document', target: () => document, event: 'mousemove', handler: this.boundOnDrag},
      {
        name: 'docMouseUp', type: 'document', target: () => document, event: 'mouseup', handler: (e: MouseEvent) => {
          this.suppressInteractions = false;
          this.boundEndDrag(e);
        }
      },
      {
        name: 'winBlur', type: 'document', target: () => window, event: 'blur', handler: () => {
          this.suppressInteractions = false;
        }
      },
      {
        name: 'visibilityChange', type: 'document', target: () => document, event: 'visibilitychange', handler: () => {
          if (document.visibilityState !== 'visible') {
            this.suppressInteractions = false;
          }
        }
      },
    ];
  }

  private attachListeners(type: 'element' | 'document' | 'all' = 'element'): void {
    this.ngZone.runOutsideAngular(() => {
      this.listeners.forEach(listener => {
        if (listener.type === 'document' && type !== 'document' && type !== 'all') return;
        if (listener.type === 'element' && type === 'document') return;
        if (listener.cleanup || !listener.target) return;
        const targetElement = listener.target();
        if (!targetElement) return;
        listener.cleanup = this.renderer.listen(targetElement, listener.event, listener.handler);
      });
    });
  }

  private detachListeners(type: 'element' | 'document' | 'all' = 'all'): void {
    this.listeners.forEach(listener => {
      if (listener.type === 'document' && type !== 'document' && type !== 'all') return;
      if (listener.type === 'element' && type === 'document') return;
      if (listener.cleanup) {
        listener.cleanup();
        listener.cleanup = undefined;
      }
    });
  }

  private onTableMouseOver(event: MouseEvent): void {
    this.cancelHideTimer();
    this.ensureScrollContainerListener();
    if (!this.table || this.isDragging) return;
    if (this.suppressInteractions) return;
    const anyButtonDown = typeof event.buttons === 'number' ? event.buttons !== 0 : false;
    if (anyButtonDown) return;
    const target = event.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    if (cell && this.table.contains(cell)) {
      const currentColumnIndex = cell.cellIndex;
      const currentRow = cell.closest('tr');
      const currentRowIndex = currentRow?.parentElement?.tagName === 'TBODY' ? Array.from(currentRow.parentElement.children).indexOf(currentRow) : -1;
      this.hoveredCell = cell;
      if (currentColumnIndex !== this.hoveredColumnIndex || this.columnHandler.style.visibility === 'hidden') {
        this.hoveredColumnIndex = currentColumnIndex;
        this.positionColumnHandler(cell);
        this.renderer.setStyle(this.columnHandler, 'visibility', 'visible');
      }
      if (currentRowIndex !== -1) {
        if (currentRowIndex !== this.hoveredRowIndex || this.rowHandler.style.visibility === 'hidden') {
          this.hoveredRowIndex = currentRowIndex;
          this.positionRowHandler(cell);
          this.renderer.setStyle(this.rowHandler, 'visibility', 'visible');
        }
      } else if (this.hoveredRowIndex !== -1) {
        this.renderer.setStyle(this.rowHandler, 'visibility', 'hidden');
        this.hoveredRowIndex = -1;
      }
    }
  }

  private onTableMouseLeave(event: MouseEvent): void {
    if (this.isDragging) return;
    if (this.suppressInteractions) return;
    const relatedTarget = event.relatedTarget as Node;
    if (relatedTarget !== this.columnHandler && relatedTarget !== this.rowHandler) {
      this.scheduleHideHandlers();
    }
  }

  private onHandlerMouseEnter(): void {
    this.cancelHideTimer();
  }

  private onHandlerMouseLeave(event: MouseEvent): void {
    if (this.isDragging) return;
    if (this.suppressInteractions) return;
    const relatedTarget = event.relatedTarget as Node;
    const isOverTable = relatedTarget && this.table && this.table.contains(relatedTarget);
    const isOverOtherHandler = (event.target === this.columnHandler && relatedTarget === this.rowHandler) || (event.target === this.rowHandler && relatedTarget === this.columnHandler);
    if (!isOverTable && !isOverOtherHandler) {
      this.scheduleHideHandlers();
    }
  }

  private onHandlerMouseDown(event: MouseEvent, mode: 'row' | 'column'): void {
    const isPrimary = (event.button === 0) && ((event.buttons & 1) === 1);
    if (!isPrimary || event.ctrlKey) {
      this.suppressInteractions = true;
      event.preventDefault();
      event.stopPropagation();
      this.cancelHideTimer();
      if (this.suppressResetTimeoutId) {
        clearTimeout(this.suppressResetTimeoutId);
        this.suppressResetTimeoutId = null;
      }
      this.suppressResetTimeoutId = setTimeout(() => {
        this.suppressInteractions = false;
        this.suppressResetTimeoutId = null;
      }, 1200);
      return;
    }
    this.startDrag(event, mode);
  }

  private createHandlers(): void {
    this.columnHandler = this.renderer.createElement('div');
    this.columnHandler.oncontextmenu = ((e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.renderer.addClass(this.columnHandler, 'drag-handler');
    this.renderer.addClass(this.columnHandler, 'column-handler');
    this.renderer.setStyle(this.columnHandler, 'position', 'fixed');
    this.renderer.setStyle(this.columnHandler, 'visibility', 'hidden');
    this.renderer.setStyle(this.columnHandler, 'z-index', '1000');
    this.rowHandler = this.renderer.createElement('div');
    this.rowHandler.oncontextmenu = ((e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.renderer.addClass(this.rowHandler, 'drag-handler');
    this.renderer.addClass(this.rowHandler, 'row-handler');
    this.renderer.setStyle(this.rowHandler, 'position', 'fixed');
    this.renderer.setStyle(this.rowHandler, 'visibility', 'hidden');
    this.renderer.setStyle(this.rowHandler, 'z-index', '1000');
  }

  private createDropIndicator(): void {
    this.dropIndicator = this.renderer.createElement('div');
    this.renderer.addClass(this.dropIndicator, 'drop-indicator');
  }

  private positionColumnHandler(cellOrIndex: HTMLElement | number): void {
    if (!this.table) {
      return;
    }
    let targetCell: HTMLElement | null = null;
    if (typeof cellOrIndex === 'number') {
      targetCell = this.findFirstVisibleCellInColumn(cellOrIndex);
      if (!targetCell) return;
    } else {
      targetCell = cellOrIndex;
    }
    const tableRect = this.table.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();
    const colHandlerLeft = cellRect.left + (cellRect.width / 2) - (this.handlerSize / 2);
    const colHandlerTop = tableRect.top - this.handlerSize - this.handlerOffset;
    this.renderer.setStyle(this.columnHandler, 'top', `${colHandlerTop}px`);
    this.renderer.setStyle(this.columnHandler, 'left', `${colHandlerLeft}px`);
  }

  private positionRowHandler(cell: HTMLElement): void {
    if (!this.table || this.isDragging) return;
    const tableRect = this.table.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const rowHandlerTop = cellRect.top + (cellRect.height / 2) - (this.handlerSize / 2);
    const rowHandlerLeft = tableRect.left - this.handlerSize - this.handlerOffset;
    this.renderer.setStyle(this.rowHandler, 'top', `${rowHandlerTop}px`);
    this.renderer.setStyle(this.rowHandler, 'left', `${rowHandlerLeft}px`);
  }

  private scheduleHideHandlers(): void {
    this.cancelHideTimer();
    this.hideTimeoutId = setTimeout(() => {
      this.hideHandlers();
      this.hideTimeoutId = null;
    }, HIDE_DELAY_MS);
  }

  private cancelHideTimer(): void {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  private hideHandlers(): void {
    if (!this.isDragging) {
      this.renderer.setStyle(this.columnHandler, 'visibility', 'hidden');
      this.renderer.setStyle(this.rowHandler, 'visibility', 'hidden');
      this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
      this.hoveredCell = null;
      this.hoveredColumnIndex = -1;
      this.hoveredRowIndex = -1;
    }
  }

  private startDrag(event: MouseEvent, mode: 'row' | 'column'): void {
    const isPrimary = (event.button === 0) && ((event.buttons & 1) === 1);
    if (!isPrimary || event.ctrlKey) {
      return;
    }
    this.cancelHideTimer();
    const sourceRow = mode === 'row' ? this.hoveredCell?.closest('tr') : null;

    if (
      !this.table || (mode === 'row' && this.hoveredRowIndex < 0) ||
      (mode === 'column' && this.hoveredColumnIndex < 0) ||
      (mode === 'row' && sourceRow?.parentElement?.tagName !== 'TBODY')
    ) {
      return;
    }
    event.preventDefault();
    this.isDragging = true;
    this.dragMode = mode;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.currentDropIndex = -1;
    if (mode === 'column') {
      this.startElementIndex = this.hoveredColumnIndex;
      this.currentDropIndex = this.startElementIndex;
      this.draggedElement = this.columnHandler;
      this.draggedElementSource = null;
      this.renderer.addClass(this.table, 'dragging-column');
      this.styleColumnAsSource(this.startElementIndex, true);
      this.calculateColumnInfo();
      this.updateColumnHandlerPositionOnDrag(event.clientX);
      this.renderer.setStyle(this.columnHandler, 'visibility', 'visible');
      this.renderer.setStyle(this.rowHandler, 'visibility', 'hidden');
      this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
    } else {
      this.startElementIndex = this.hoveredRowIndex;
      this.currentDropIndex = this.startElementIndex;
      this.draggedElement = this.rowHandler;
      this.draggedElementSource = sourceRow!;
      this.renderer.addClass(this.draggedElementSource, 'dragging-source');
      this.renderer.addClass(this.table, 'dragging-row');
      this.calculateRowInfo();
      this.handlerStartY = parseFloat(this.rowHandler.style.top || '0');
      this.updateRowHandlerPositionOnDrag(event.clientY);
      this.renderer.setStyle(this.rowHandler, 'visibility', 'visible');
      this.renderer.setStyle(this.columnHandler, 'visibility', 'hidden');
      this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
    }
    if (this.draggedElement) {
      this.renderer.addClass(this.draggedElement, 'dragging-active-handler');
    }
    this.attachListeners('document');
  }

  private onDrag(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedElement || !this.table) return;
    if ((event.buttons & 1) !== 1) {
      this.endDrag(event);
      return;
    }
    event.preventDefault();
    this.moveStart.emit();
    const currentX = event.clientX;
    const currentY = event.clientY;
    document.body.style.cursor = 'grabbing';
    if (this.dragMode === 'row') {
      this.updateRowHandlerPositionOnDrag(currentY);
      const currentHandlerCenterY = parseFloat(this.rowHandler.style.top || '0') + this.handlerSize / 2;
      const newVisualTargetIndex = this.getVisualTargetRowIndex(currentHandlerCenterY);
      if (newVisualTargetIndex !== -1) {
        this.updateDropIndicator(newVisualTargetIndex, 'row');
        this.currentDropIndex = newVisualTargetIndex;
      } else {
        this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
        this.currentDropIndex = -1;
      }
      this.clearDropHighlights();
    } else if (this.dragMode === 'column') {
      this.updateColumnHandlerPositionOnDrag(currentX);
      const currentHandlerCenterX = parseFloat(this.columnHandler.style.left || '0') + this.handlerSize / 2;
      const newVisualTargetIndex = this.getVisualTargetColumnIndex(currentHandlerCenterX);
      if (newVisualTargetIndex !== -1) {
        this.updateDropIndicator(newVisualTargetIndex, 'column');
        this.currentDropIndex = newVisualTargetIndex;
      } else {
        this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
        this.currentDropIndex = -1;
      }
      this.clearDropHighlights();
    }
  }

  private getVisualTargetColumnIndex(currentHandlerCenterX: number): number {
    if (this.startElementIndex < 0 || !this.columnInfo?.length) return -1;
    let potentialTargetIndex = this.startElementIndex;
    const currentGeometry = this.columnInfo;
    for (const targetColumn of currentGeometry) {
      if (targetColumn.index === this.startElementIndex) continue;
      const targetCenter = targetColumn.center;
      const threshold = targetColumn.width * 0.5;
      if (targetColumn.index > this.startElementIndex && currentHandlerCenterX > targetCenter - threshold) {
        potentialTargetIndex = Math.max(potentialTargetIndex, targetColumn.index);
      } else if (targetColumn.index < this.startElementIndex && currentHandlerCenterX < targetCenter + threshold) {
        potentialTargetIndex = (potentialTargetIndex === this.startElementIndex) ? targetColumn.index : Math.min(potentialTargetIndex, targetColumn.index);
      }
    }
    return potentialTargetIndex;
  }

  private getVisualTargetRowIndex(currentHandlerCenterY: number): number {
    if (this.startElementIndex < 0 || !this.table?.tBodies[0] || !this.rowInfo?.length) return -1;
    let potentialTargetIndex = this.startElementIndex;
    const currentGeometry = this.rowInfo;
    for (const targetRow of currentGeometry) {
      if (targetRow.index === this.startElementIndex) continue;
      const targetCenter = targetRow.center;
      const threshold = targetRow.height * 0.5;
      if (targetRow.index > this.startElementIndex && currentHandlerCenterY > targetCenter - threshold) {
        potentialTargetIndex = Math.max(potentialTargetIndex, targetRow.index);
      } else if (targetRow.index < this.startElementIndex && currentHandlerCenterY < targetCenter + threshold) {
        potentialTargetIndex = (potentialTargetIndex === this.startElementIndex) ? targetRow.index : Math.min(potentialTargetIndex, targetRow.index);
      }
    }
    return potentialTargetIndex;
  }

  private updateColumnHandlerPositionOnDrag(currentX: number): void {
    if (!this.table || !this.columnHandler) return;
    const handlerLeft = currentX - (this.handlerSize / 2);
    this.renderer.setStyle(this.columnHandler, 'left', `${handlerLeft}px`);
  }

  private updateRowHandlerPositionOnDrag(currentY: number): void {
    if (!this.table || !this.rowHandler) return;
    const deltaY = currentY - this.startY;
    const handlerTop = this.handlerStartY + deltaY;
    this.renderer.setStyle(this.rowHandler, 'top', `${handlerTop}px`);
  }

  private endDrag(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.detachListeners('document');
    event.preventDefault();
    this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
    if (!this.table) {
      this.cleanupDragState();
      return;
    }
    const finalTargetIndex = this.currentDropIndex;
    if (this.startElementIndex !== -1 && finalTargetIndex !== -1 && finalTargetIndex !== this.startElementIndex) {
      if (this.dragMode === 'column') {
        this.moveColumn(this.startElementIndex, finalTargetIndex);
        this.columnMoved.emit({
          startElementIndex: this.startElementIndex,
          finalTargetIndex
        });
      } else if (this.dragMode === 'row') {
        this.moveRow(this.startElementIndex, finalTargetIndex);
        this.rowMoved.emit({
          startElementIndex: this.startElementIndex,
          finalTargetIndex
        });
      }
    }
    this.cleanupDragState();
    this.moveEnd.emit();
    this.table
      .querySelectorAll('td.dragging-source, th.dragging-source')
      .forEach(cell => {
        this.renderer.removeClass(cell, 'dragging-source');
      });
  }

  private cleanupDragState(): void {
    const draggedMode = this.dragMode;
    const startIndex = this.startElementIndex;
    const sourceElement = this.draggedElementSource;
    const activeHandler = this.draggedElement;
    this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
    this.isDragging = false;
    this.dragMode = null;
    this.startElementIndex = -1;
    this.draggedElement = null;
    this.draggedElementSource = null;
    this.columnInfo = [];
    this.rowInfo = [];
    this.currentDropIndex = -1;
    this.handlerStartY = 0;
    this.suppressInteractions = false;
    this.clearDropHighlights();
    if (this.table) {
      if (draggedMode === 'column') {
        this.renderer.removeClass(this.table, 'dragging-column');
        if (startIndex >= 0) {
          this.styleColumnAsSource(startIndex, false);
          this.highlightColumn(startIndex, false);
        } else {
          this.table.querySelectorAll('td.dragging-source, th.dragging-source').forEach(cell => this.renderer.removeClass(cell, 'dragging-source'));
          this.table.querySelectorAll('.col-highlight').forEach(cell => this.renderer.removeClass(cell, 'col-highlight'));
        }
      } else if (draggedMode === 'row') {
        this.renderer.removeClass(this.table, 'dragging-row');
        if (sourceElement) this.renderer.removeClass(sourceElement, 'dragging-source');
      }
    }
    if (activeHandler) {
      this.renderer.removeClass(activeHandler, 'dragging-active-handler');
    }
    document.body.style.cursor = '';
    this.hideHandlers();
    this.cancelHideTimer();
  }

  private moveRow(fromIndex: number, toIndex: number): void {
    if (!this.table) {
      return;
    }
    const tbody = this.table.tBodies[0];
    if (!tbody) {
      return;
    }
    const visibleRows = Array.from(tbody.rows).filter(r => !r.classList.contains('dragging-source'));
    if (fromIndex < 0 || fromIndex >= visibleRows.length || toIndex < 0 || toIndex > visibleRows.length || fromIndex === toIndex) {
      const allRows = Array.from(tbody.rows);
      if (fromIndex < 0 || fromIndex >= allRows.length || toIndex < 0 || toIndex > allRows.length || fromIndex === toIndex) {
        return;
      }
    }
    const rowToMove = tbody.querySelector('tr.dragging-source') as HTMLTableRowElement | null;
    if (!rowToMove) {
      return;
    }
    const actualFromIndex = Array.from(tbody.rows).indexOf(rowToMove);
    const allRows = Array.from(tbody.rows);
    let referenceNode: Node | null = null;
    let currentVisibleIndex = 0;
    let actualInsertIndex = -1;
    for (let i = 0; i < allRows.length; i++) {
      if (!allRows[i].classList.contains('dragging-source')) {
        if (currentVisibleIndex === toIndex) {
          actualInsertIndex = i;
          break;
        }
        currentVisibleIndex++;
      }
    }
    if (actualInsertIndex === -1 && toIndex === visibleRows.length) {
      actualInsertIndex = allRows.length;
    }
    if (actualInsertIndex !== -1) {
      if (actualFromIndex < actualInsertIndex) {
        referenceNode = allRows[actualInsertIndex] ?? null;
      } else {
        referenceNode = allRows[actualInsertIndex];
      }
    } else {
      return;
    }
    try {
      this.renderer.insertBefore(tbody, rowToMove, referenceNode);
    } catch (error) {
    }
    this.hoveredRowIndex = -1;
  }

  private moveColumn(fromIndex: number, toIndex: number): void {
    if (!this.table || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }
    let moved = false;
    for (let i = 0; i < this.table.rows.length; i++) {
      const row = this.table.rows[i];
      const cells = Array.from(row.cells);
      if (fromIndex >= cells.length || toIndex > cells.length) {
        continue;
      }
      const cellToMove = cells[fromIndex] as HTMLElement | undefined;
      let referenceNode: Node | null = null;
      if (fromIndex < toIndex) {
        referenceNode = cells[toIndex + 1] ?? null;
      } else {
        referenceNode = cells[toIndex];
      }
      if (cellToMove) {
        try {
          this.renderer.insertBefore(row, cellToMove, referenceNode);
          moved = true;
        } catch (error) {
        }
      }
    }
  }

  private styleColumnAsSource(columnIndex: number, add: boolean): void {
    if (!this.table || columnIndex < 0) return;
    for (let i = 0; i < this.table.rows.length; i++) {
      const row = this.table.rows[i];
      if (columnIndex < row.cells.length) {
        const cell = row.cells[columnIndex];
        if (cell) {
          if (add) {
            this.renderer.addClass(cell, 'dragging-source');
          } else {
            this.renderer.removeClass(cell, 'dragging-source');
          }
        }
      }
    }
  }

  private calculateColumnInfo(): void {
    this.columnInfo = [];
    if (!this.table || this.table.rows.length === 0) return;
    const referenceRow = this.table.tHead?.rows[0] ?? this.table.rows[0];
    if (!referenceRow) return;
    for (let i = 0; i < referenceRow.cells.length; i++) {
      const cell = referenceRow.cells[i] as HTMLElement;
      const rect = cell.getBoundingClientRect();
      this.columnInfo.push({index: i, left: rect.left, width: rect.width, center: rect.left + rect.width / 2});
    }
  }

  private calculateRowInfo(): void {
    this.rowInfo = [];
    if (!this.table || !this.table.tBodies[0]) return;
    const tbody = this.table.tBodies[0];
    let visibleIndex = 0;
    for (let i = 0; i < tbody.rows.length; i++) {
      const row = tbody.rows[i] as HTMLTableRowElement;
      const rect = row.getBoundingClientRect();
      this.rowInfo.push({
        index: visibleIndex,
        element: row,
        top: rect.top,
        height: rect.height,
        center: rect.top + rect.height / 2
      });
      visibleIndex++;
    }
  }

  private findFirstVisibleCellInColumn(columnIndex: number): HTMLElement | null {
    if (!this.table || columnIndex < 0) return null;
    for (let i = 0; i < this.table.rows.length; i++) {
      const row = this.table.rows[i];
      if (columnIndex < row.cells.length) {
        const c = row.cells[columnIndex] as HTMLElement;
        if (c && c.offsetParent !== null) {
          return c;
        }
      }
    }
    return null;
  }

  private updateDropIndicator(targetVisualIndex: number, mode: 'row' | 'column'): void {
    if (!this.table || targetVisualIndex < 0 || this.startElementIndex < 0) {
      this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
      return;
    }
    const insertBeforeIndex = (targetVisualIndex <= this.startElementIndex) ? targetVisualIndex : targetVisualIndex + 1;
    if (insertBeforeIndex === this.startElementIndex || insertBeforeIndex === this.startElementIndex + 1) {
      this.renderer.setStyle(this.dropIndicator, 'visibility', 'hidden');
      return;
    }
    const tableRect = this.table.getBoundingClientRect();
    if (mode === 'column') {
      const referenceColumnInfo = this.columnInfo.find(c => c.index === insertBeforeIndex);
      let indicatorLeftTable = 0;
      if (referenceColumnInfo) {
        indicatorLeftTable = referenceColumnInfo.left - tableRect.left;
      } else {
        const lastColInfo = this.columnInfo[this.columnInfo.length - 1];
        indicatorLeftTable = lastColInfo ? (lastColInfo.left - tableRect.left + lastColInfo.width) : this.table.offsetWidth;
      }
      indicatorLeftTable -= Math.floor(this.indicatorThickness / 2);
      this.renderer.setStyle(this.dropIndicator, 'left', `${indicatorLeftTable}px`);
      this.renderer.setStyle(this.dropIndicator, 'top', `0px`);
      this.renderer.setStyle(this.dropIndicator, 'height', `${this.table.offsetHeight}px`);
      this.renderer.setStyle(this.dropIndicator, 'width', `${this.indicatorThickness}px`);
      this.renderer.removeStyle(this.dropIndicator, 'right');
      this.renderer.removeStyle(this.dropIndicator, 'bottom');
    } else {
      const referenceRowInfo = this.rowInfo.find(r => r.index === insertBeforeIndex);
      let indicatorTopTable = 0;
      if (referenceRowInfo) {
        indicatorTopTable = referenceRowInfo.top - tableRect.top;
      } else {
        const lastRowInfo = this.rowInfo[this.rowInfo.length - 1];
        indicatorTopTable = lastRowInfo
          ? (lastRowInfo.top - tableRect.top + lastRowInfo.height)
          : (this.table.tBodies[0]?.offsetHeight ?? this.table.offsetHeight);
      }
      indicatorTopTable -= Math.floor(this.indicatorThickness / 2);
      this.renderer.setStyle(this.dropIndicator, 'top', `${indicatorTopTable}px`);
      this.renderer.setStyle(this.dropIndicator, 'left', `0px`);
      this.renderer.setStyle(this.dropIndicator, 'width', `${this.table.offsetWidth}px`);
      this.renderer.setStyle(this.dropIndicator, 'height', `${this.indicatorThickness}px`);
      this.renderer.removeStyle(this.dropIndicator, 'bottom');
      this.renderer.removeStyle(this.dropIndicator, 'right');
    }
    this.renderer.setStyle(this.dropIndicator, 'visibility', 'visible');
  }

  private highlightColumn(index: number, add: boolean): void {
  }

  private clearDropHighlights(): void {
  }

  private getCurrentScrollContainer(): Element | Window | null {
    if (isPlatformServer(this._platformId)) {
      return null;
    }
    try {
      const container = (this.contentBuilder as any)?.getScrollContainer?.();
      return (container as Element | Window) || null;
    } catch {
      return null;
    }
  }

  private bindScrollContainerListener(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }
    if (this.scrollSub) {
      return;
    }
    this.unbindScrollContainerListener();
    this.ngZone.runOutsideAngular(() => {
      const scroll$ = (this.contentBuilder as any)?.scrollContainerScrolled as Observable<number> | undefined;
      if (!scroll$) {
        return;
      }
      this.scrollSub = scroll$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onScrollContainerScrolled());
    });
  }

  private unbindScrollContainerListener(): void {
    if (this.scrollSub) {
      try { this.scrollSub.unsubscribe(); } catch {}
      this.scrollSub = null;
    }
    this.scrollContainerRef = null;
  }

  private ensureScrollContainerListener(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    if (!this.scrollSub) this.bindScrollContainerListener();
  }

  private onScrollContainerScrolled(): void {
    this.cancelHideTimer();
    this.hideHandlers();
  }
}
