// src/app/text-selection-popup.directive.ts

import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  HostListener,
  Type,
  ViewContainerRef,
  ElementRef,
  Renderer2,
  NgZone
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  GlobalPositionStrategy,
  OverlayContainer
} from '@angular/cdk/overlay';
import {
  ComponentPortal
} from '@angular/cdk/portal';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

export interface ISelectionPopupComponent {
  observedElement?: HTMLElement | null;
}

const POPUP_VERTICAL_OFFSET = 8;

@Directive({
  selector: '[ngsTextSelectionPopup]',
  standalone: true,
})
export class TextSelectionPopupDirective implements OnDestroy {

  @Input() targetComponent!: Type<ISelectionPopupComponent>;
  @Input() closestContentObserverClass: string | null = null;
  @Output() tagSelected = new EventEmitter<string | null>();

  private overlayRef: OverlayRef | null = null;
  private hostElement: HTMLElement;
  private currentSelectionRange: Range | null = null;
  private documentClickListener: (() => void) | null = null;
  private positionStrategy: GlobalPositionStrategy | null = null;
  private scrollListener: (() => void) | null = null;
  private scrollSubject = new Subject<void>();
  private scrollSubscription: Subscription | null = null;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private overlayContainer: OverlayContainer,
    private ngZone: NgZone
  ) {
    this.hostElement = this.elementRef.nativeElement;
    this.scrollSubscription = this.scrollSubject.pipe(
      throttleTime(50, undefined, { leading: true, trailing: true })
    ).subscribe(() => {
      this.updatePopupPositionOnScroll();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClickHostListener(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.cdk-overlay-container')) {
      return;
    }

    this.processSelection();
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (!this.overlayRef) return;
    if (this.isEventInsidePopup(event)) return;
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock',
      'Escape', 'Tab',
      'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown',
      'Insert', 'ContextMenu',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];
    if (ignoredKeys.includes(event.key)) {
      setTimeout(() => this.processSelection(), 0);
      return;
    }

    if ((event.target as HTMLElement).closest('.cdk-overlay-container')) {
      return;
    }

    this.closePopup();
  }

  private processSelection(): void {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      if (this.overlayRef && !this.isFocusInsidePopup()) {
        this.closePopup();
      }
      this.currentSelectionRange = null;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!this.hostElement.contains(range.startContainer) || !this.hostElement.contains(range.endContainer)) {
      this.closePopupIfNeeded();
      this.currentSelectionRange = null;
      return;
    }

    let observedElement: HTMLElement | null = null;
    if (this.closestContentObserverClass) {
      observedElement = this.findClosestElementWithClass(range.startContainer, this.closestContentObserverClass);
      if (!observedElement) {
        this.closePopupIfNeeded();
        this.currentSelectionRange = null;
        return;
      }
    }

    const selectedText = selection.toString().trim();
    if (selectedText) {
      const selectionRects = range.getClientRects();
      if (selectionRects.length > 0) {
        const startRect = selectionRects[0];
        const lastRect = selectionRects[selectionRects.length - 1];
        const hostRect = this.hostElement.getBoundingClientRect();
        const hostCenterX = hostRect.left + hostRect.width / 2;
        const selectionStartX = startRect.left;
        const selectionEndX = lastRect.right;
        const selectionCenterX = selectionStartX + (selectionEndX - selectionStartX) / 2;
        const alignRight = selectionCenterX >= hostCenterX;
        const scrollX = document.body.scrollLeft;
        const scrollY = document.body.scrollTop;
        const anchorX = selectionStartX + scrollX;
        const endX = selectionEndX + scrollX;
        const anchorY = startRect.top + scrollY;
        const containingTagName = this.getContainingTagName(range);
        const newRange = range.cloneRange();

        if (!this.overlayRef || !this.areRangesEqual(this.currentSelectionRange, newRange)) {
          this.closePopupIfNeeded();
          this.currentSelectionRange = newRange;
          this.showPopup({ x: anchorX, y: anchorY }, endX, alignRight, observedElement);
          this.tagSelected.emit(containingTagName);
        }
      } else { this.closePopupIfNeeded(); this.currentSelectionRange = null; }
    } else { this.closePopupIfNeeded(); this.currentSelectionRange = null; }
  }

  private showPopup(anchorPosition: { x: number; y: number }, selectionEndX: number, alignRight: boolean, observedElement: HTMLElement | null): void {
    if (!this.targetComponent || this.overlayRef) return;

    this.positionStrategy = this.overlay.position().global();
    this.positionStrategy.left(`${anchorPosition.x}px`).top(`${anchorPosition.y}px`);

    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });

    const portal = new ComponentPortal(this.targetComponent, this.viewContainerRef);
    const componentRef = this.overlayRef.attach(portal);

    if (componentRef.instance && 'observedElement' in componentRef.instance) {
      componentRef.instance.observedElement = observedElement;
    }

    if (this.overlayRef) {
      Promise.resolve().then(() => {
        if (this.overlayRef && this.positionStrategy) {
          try {
            const overlayElement = this.overlayRef.overlayElement;
            const popupHeight = overlayElement.offsetHeight;
            const popupWidth = overlayElement.offsetWidth;
            if (popupHeight > 0 && popupWidth > 0) {
              const correctTop = anchorPosition.y - popupHeight - POPUP_VERTICAL_OFFSET;
              const correctLeft = alignRight ? selectionEndX - popupWidth : anchorPosition.x;
              this.positionStrategy.left(`${correctLeft}px`).top(`${correctTop}px`);
              this.overlayRef.updatePosition();
            }
          } catch(e) { console.error("Error correcting initial popup position:", e); }
          this.addDocumentClickListener();
          this.addScrollListener();
        }
      });
    }
  }

  private closePopupIfNeeded(): void {
    if (this.overlayRef) {
      this.closePopup();
    }
  }

  private closePopup(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose(); this.overlayRef = null;
    this.positionStrategy = null; this.currentSelectionRange = null;
    this.removeDocumentClickListener();
    this.removeScrollListener();
  }

  private addScrollListener(): void {
    if (this.scrollListener) return;
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = this.renderer.listen(document, 'scroll', (event) => {
        this.scrollSubject.next();
      });
    });
  }

  private removeScrollListener(): void {
    if (this.scrollListener) { this.scrollListener(); this.scrollListener = null; }
  }

  private updatePopupPositionOnScroll(): void {
    if (!this.overlayRef || !this.positionStrategy || !this.currentSelectionRange) return;
    try {
      const selectionRects = this.currentSelectionRange.getClientRects();
      if (selectionRects.length > 0) {
        const startRect = selectionRects[0];
        const lastRect = selectionRects[selectionRects.length - 1];
        const hostRect = this.hostElement.getBoundingClientRect();
        const hostCenterX = hostRect.left + hostRect.width / 2;
        const selectionStartX = startRect.left;
        const selectionEndX = lastRect.right;
        const selectionCenterX = selectionStartX + (selectionEndX - selectionStartX) / 2;
        const alignRight = selectionCenterX >= hostCenterX;
        const scrollX = document.body.scrollLeft;
        const scrollY = document.body.scrollTop;
        const textTop = startRect.top + scrollY;
        const popupElement = this.overlayRef.overlayElement;
        const popupHeight = popupElement.offsetHeight;
        const popupWidth = popupElement.offsetWidth;
        let newX: number;
        if (alignRight) {
          newX = (lastRect.right + scrollX) - popupWidth;
        } else {
          newX = startRect.left + scrollX;
        }
        const newY = textTop - popupHeight - POPUP_VERTICAL_OFFSET;
        this.ngZone.run(() => {
          if (this.overlayRef && this.positionStrategy) {
            this.positionStrategy.left(`${newX}px`).top(`${newY}px`);
            this.overlayRef.updatePosition();
          }
        });
      } else { this.ngZone.run(() => this.closePopup()); }
    } catch(e) {
      console.error("Error updating popup position on scroll:", e);
      this.ngZone.run(() => this.closePopup());
    }
  }

  private findClosestElementWithClass(startNode: Node, className: string): HTMLElement | null {
    let currentNode: Node | null = startNode;
    const hostParent = this.hostElement.parentNode;
    while (currentNode && currentNode !== hostParent && currentNode !== document.body && currentNode !== document.documentElement) {
      if (currentNode instanceof Element && currentNode.classList.contains(className)) {
        return currentNode as HTMLElement;
      }
      currentNode = currentNode.parentNode;
    }
    if(this.hostElement.classList.contains(className)){
      return this.hostElement;
    }
    return null;
  }

  private getContainingTagName(range: Range): string | null {
    let container: Node | null = range.commonAncestorContainer;
    while (container && container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode as Node | null;
    }
    return container instanceof Element ? container.tagName : null;
  }

  private addDocumentClickListener(): void {
    if (this.documentClickListener) return;
    this.documentClickListener = this.renderer.listen(document, 'click', (event: MouseEvent) => {
      this.handleDocumentClick(event);
    });
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) { this.documentClickListener(); this.documentClickListener = null; }
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this.overlayRef || !event.target) return;
    const clickedElement = event.target as Node;
    if (this.isEventInsidePopup(event)) return;
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    if (overlayContainerElement.contains(clickedElement)) return;
    this.closePopup();
  }

  private isEventInsidePopup(event: MouseEvent | KeyboardEvent): boolean {
    if (!this.overlayRef?.overlayElement || !event.target) return false;
    return this.overlayRef.overlayElement.contains(event.target as Node);
  }

  private isClickInsidePopup(node: Node): boolean {
    return !!this.overlayRef?.overlayElement?.contains(node);
  }

  private isFocusInsidePopup(): boolean {
    if (!this.overlayRef?.overlayElement || !document.activeElement) return false;
    return this.overlayRef.overlayElement.contains(document.activeElement);
  }

  private areRangesEqual(r1: Range | null, r2: Range | null): boolean {
    if (!r1 || !r2) return r1 === r2;
    return (
      r1.commonAncestorContainer === r2.commonAncestorContainer &&
      r1.startContainer === r2.startContainer &&
      r1.endContainer === r2.endContainer &&
      r1.startOffset === r2.startOffset &&
      r1.endOffset === r2.endOffset
    );
  }

  ngOnDestroy(): void {
    this.closePopup();
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
      this.scrollSubscription = null;
    }
    this.removeDocumentClickListener();
    this.removeScrollListener();
  }
}
