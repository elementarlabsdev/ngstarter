import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsFocusMonitor]'
})
export class FocusMonitorDirective {
  private _elementRef = inject(ElementRef);
}
