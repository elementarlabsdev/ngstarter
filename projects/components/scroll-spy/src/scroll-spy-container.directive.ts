import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsScrollSpyContainer]',
  exportAs: 'ngsScrollSpyContainer',
  host: {
    'class': 'ngs-scroll-spy-container'
  }
})
export class ScrollSpyContainerDirective {
  private elementRef = inject(ElementRef);

  getScrollContainer(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
