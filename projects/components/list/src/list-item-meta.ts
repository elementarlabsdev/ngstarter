import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsListItemMeta]',
  standalone: true,
  host: {
    'class': 'ngs-list-item-meta',
  },
})
export class ListItemMeta {
  private readonly _elementRef = inject(ElementRef);
}
