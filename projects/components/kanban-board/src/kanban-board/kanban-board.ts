import {
  Component,
  contentChild, DestroyRef,
  ElementRef,
  inject,
  input, OnInit,
  output,
  Renderer2,
  signal,
  viewChild
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Icon } from '@ngstarter/components/icon';
import { Ripple } from '@ngstarter/components/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { KanbanColumn, KanbanItem, KanbanItemSortedEvent, KanbanItemTransferredEvent } from '../types';
import { KanbanItemDefDirective } from '../kanban-item-def.directive';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-kanban-board',
  exportAs: 'ngsKanbanBoard',
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    Icon,

    Ripple,
    PanelContent,
    Panel,
    PanelHeader,
    NgTemplateOutlet,
    FormsModule,
    Menu,
    MenuItem,
    MenuTrigger,
    Button
  ],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.scss',
  host: {
    'class': 'ngs-kanban-board',
    '[class.is-dragging-active]': 'isDraggingActive'
  }
})
export class KanbanBoard<T extends KanbanColumn<K>, K extends KanbanItem> implements OnInit {
  protected _itemTplDef = contentChild.required(KanbanItemDefDirective);
  private _headerContainer = viewChild.required('headerContainer', { read: ElementRef });
  private _scrollContainer = viewChild.required('scrollContainer', { read: ElementRef });
  private _renderer = inject(Renderer2);
  private _destroyRef = inject(DestroyRef);

  columns = input<T[]>([]);
  colors = input<string[]>([]);

  protected _hasVerticalScroll = signal(false);

  readonly columnEdit = output<T>();
  readonly columnDelete = output<{ column: T, index: number }>();
  readonly itemAdd = output<void>();
  readonly itemClick = output<K>();
  readonly itemDropped = output<CdkDragDrop<K[]>>();
  readonly itemSorted = output<KanbanItemSortedEvent>();
  readonly itemTransferred = output<KanbanItemTransferredEvent<K>>();

  private _startContainerXOffset = 0;
  private _itemXOffset = 0;
  private _itemWidth = 0;
  protected isDraggingActive = false;
  private _autoScrollStarted = false;

  ngOnInit() {
    fromEvent(this._scrollContainer().nativeElement, 'scroll')
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event: any) => {
        this.onScroll(event);
      });
  }

  onDropped(event: CdkDragDrop<K[]>) {
    this.itemDropped.emit(event);

    if (event.previousContainer === event.container) {
      this.itemSorted.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex
      });
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.itemTransferred.emit({
        previousContainerData: event.previousContainer.data,
        currentContainerData: event.container.data,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex
      });
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const headerContainerElement = this._headerContainer().nativeElement as HTMLElement;
    this._renderer.setStyle(headerContainerElement, 'transform', `translate(-${target.scrollLeft}px, 0)`);
    this._hasVerticalScroll.set(target.scrollTop > 0);
  }

  onDragStarted(event: CdkDragStart, element: HTMLElement) {
    this.isDraggingActive = true;
  }

  onDragMoved(event: CdkDragMove<K>) {
    const space = 100;
    const scrollContainer = this._scrollContainer().nativeElement as HTMLElement;
    const scrollContainerWidth = scrollContainer.getBoundingClientRect().width;
    const itemOffsetXStart = this._startContainerXOffset + event.distance.x;
    const itemOffsetXEnd = this._startContainerXOffset + event.distance.x + this._itemWidth;

    if (!this._autoScrollStarted) {
      if (itemOffsetXEnd + space >= scrollContainerWidth) {
        this._autoScrollStarted = true;
        scrollContainer.scroll({
          left: scrollContainer.scrollLeft + this._itemWidth * 2,
          behavior: 'smooth'
        });
        setTimeout(() => {
          this._autoScrollStarted = false;
        }, 500);
      } else if (itemOffsetXStart <= space && scrollContainer.scrollLeft > 0) {
        this._autoScrollStarted = true;
        scrollContainer.scroll({
          left: scrollContainer.scrollLeft - this._itemWidth * 2,
          behavior: 'smooth'
        });
        setTimeout(() => {
          this._autoScrollStarted = false;
        }, 500);
      }
    }
  }

  onDragEnded(event: CdkDragEnd) {
    this.isDraggingActive = false;
  }

  protected itemMousedown(event: MouseEvent) {
    const scrollContainerElement = this._scrollContainer().nativeElement as HTMLElement;
    let targetElement = event.target as Element;

    if (!targetElement.classList.contains('kanban-item')) {
      targetElement = targetElement.closest('.kanban-item') as HTMLElement;
    }

    const targetRect = targetElement.getBoundingClientRect();
    this._startContainerXOffset = targetRect.x - scrollContainerElement.getBoundingClientRect().x;
    this._itemXOffset = event.clientX - targetRect.x;
    this._itemWidth = targetRect.width;
  }
}
