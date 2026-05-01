import { Directive, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ngsBlockLoaderContainer]'
})
export class BlockLoaderContainerDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    const element = this.elementRef.nativeElement as HTMLElement;
    this.renderer.setStyle(element, 'position', 'relative');
  }

  ngOnDestroy() {
    const element = this.elementRef.nativeElement as HTMLElement;
    this.renderer.removeStyle(element, 'position');
  }
}
