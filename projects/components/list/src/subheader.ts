import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsSubheader]',
  standalone: true,
  host: {
    'class': 'ngs-subheader',
  },
})
export class Subheader {
  private readonly _elementRef = inject(ElementRef);
}
