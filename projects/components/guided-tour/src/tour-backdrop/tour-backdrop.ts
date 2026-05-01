import { Component, ElementRef, inject, signal, HostListener, computed, output, input } from '@angular/core';

@Component({
  selector: 'ngs-tour-backdrop',
  standalone: true,
  templateUrl: './tour-backdrop.html',
  styleUrl: './tour-backdrop.scss',
  host: {
    '[class.is-initial]': 'isInitial()',
    '[class.animate-enter]': 'animateEnterClass()',
    '[class.animate-leave]': 'animateLeaveClass()',
    '[style.pointer-events]': '"none"',
  },
})
export class TourBackdrop {
  private readonly elementRef = inject(ElementRef);

  backdropClick = output<void>();

  animateEnterClass = input(true);

  animateLeaveClass = input(false);

  rect = signal<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });
  rx = signal<number>(0);
  padding = signal<number>(0);
  disableInteraction = signal<boolean>(false);
  viewBox = signal<string>(`0 0 ${window.innerWidth || 1000} ${window.innerHeight || 1000}`);
  isInitial = signal<boolean>(true);

  backdropPath = computed(() => {
    const { top, left, width, height } = this.rect();
    const p = this.padding();
    const radius = this.rx();
    const w = window.innerWidth;
    const h = window.innerHeight;

    const rectTop = top - p;
    const rectLeft = left - p;
    const rectWidth = width + 2 * p;
    const rectHeight = height + 2 * p;

    // Внешний прямоугольник (весь экран)
    const screenPath = `M0,0 H${w} V${h} H0 Z`;

    // Отверстие (внутренний контур)
    const holePath = `
      M${rectLeft + radius},${rectTop}
      L${rectLeft + rectWidth - radius},${rectTop}
      A${radius},${radius} 0 0 1 ${rectLeft + rectWidth},${rectTop + radius}
      L${rectLeft + rectWidth},${rectTop + rectHeight - radius}
      A${radius},${radius} 0 0 1 ${rectLeft + rectWidth - radius},${rectTop + rectHeight}
      L${rectLeft + radius},${rectTop + rectHeight}
      A${radius},${radius} 0 0 1 ${rectLeft},${rectTop + rectHeight - radius}
      L${rectLeft},${rectTop + radius}
      A${radius},${radius} 0 0 1 ${rectLeft + radius},${rectTop}
      Z
    `.replace(/\s+/g, ' ');

    return `${screenPath} ${holePath}`;
  });

  constructor() {
    this.updateViewBox();
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onResize(): void {
    this.updatePositionFromAnchor();
    this.updateViewBox();
  }

  private anchorElement: HTMLElement | null = null;

  updatePosition(rect: DOMRect, borderRadius: string, anchorElement?: HTMLElement, padding = 0, disableInteraction = false): void {
    if (anchorElement) {
      this.anchorElement = anchorElement;
    }
    const isInitial = this.isInitial();
    this.rect.set({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });

    const radius = parseInt(borderRadius, 10) || 0;
    this.rx.set(radius);
    this.padding.set(padding);
    this.disableInteraction.set(disableInteraction);

    this.updateViewBox();

    if (isInitial) {
      setTimeout(() => {
        this.isInitial.set(false);
      });
    }
  }

  private updatePositionFromAnchor(): void {
    if (this.anchorElement) {
      const rect = this.anchorElement.getBoundingClientRect();
      this.rect.set({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  }

  private updateViewBox(): void {
    const w = window.innerWidth || 1000;
    const h = window.innerHeight || 1000;
    this.viewBox.set(`0 0 ${w} ${h}`);
  }
}
