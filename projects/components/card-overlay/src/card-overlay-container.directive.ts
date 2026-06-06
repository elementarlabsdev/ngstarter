import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ngsCardOverlayContainer]',
  exportAs: 'ngsCardOverlayContainer',
  host: {
    'class': 'ngs-card-overlay-container',
  }
})
export class CardOverlayContainerDirective implements OnInit {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);

  ngOnInit() {
    const nativeElement = this._elementRef.nativeElement as HTMLElement;
    this._renderer.setStyle(nativeElement, 'position', 'relative');
    this._renderer.setStyle(nativeElement, 'overflow', 'hidden');
  }
}
