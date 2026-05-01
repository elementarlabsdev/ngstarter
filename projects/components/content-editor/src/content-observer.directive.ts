import { Directive, ElementRef, inject, input, OnDestroy, OnInit, output, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Directive({
  selector: '[ngsContentObserver]'
})
export class ContentObserverDirective implements OnInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);
  private _elementRef = inject(ElementRef);
  private _observer!: MutationObserver;

  detectAddedNode = input.required();

  readonly nodeAdded = output<HTMLElement>();

  ngOnInit() {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    const config = { attributes: false, childList: true, subtree: false };
    const callback = (mutationList: any, observer: any) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const addedNode = mutation.addedNodes[0];

          if (addedNode && addedNode.tagName && addedNode.classList.contains(this.detectAddedNode())) {
            this.nodeAdded.emit(addedNode);
          }
        }
      }
    };
    this._observer = new MutationObserver(callback);
    this._observer.observe(this._elementRef.nativeElement, config);
  }

  ngOnDestroy() {
    this._observer?.disconnect();
  }
}
