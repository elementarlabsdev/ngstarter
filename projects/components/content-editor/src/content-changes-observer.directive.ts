import { Directive, ElementRef, inject, OnDestroy, OnInit, output, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Directive({
  selector: '[ngsContentChangesObserver]'
})
export class ContentChangesObserverDirective implements OnInit, OnDestroy {
  private _platformId = inject(PLATFORM_ID);
  private _elementRef = inject(ElementRef);
  private _observer!: MutationObserver;

  readonly contentChanged = output<void>();

  ngOnInit() {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    const config = { attributes: true, childList: true, subtree: true };
    const callback = (mutationList: any, observer: any) => {
      // let hasChanges = false;
      //
      // this.contentChanged.emit();
    };
    this._observer = new MutationObserver(callback);
    this._observer.observe(this._elementRef.nativeElement, config);
  }

  ngOnDestroy() {
    this._observer?.disconnect();
  }
}
