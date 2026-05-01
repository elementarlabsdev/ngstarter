import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsListItemAvatar]',
  standalone: true,
  host: {
    'class': 'ngs-list-item-avatar',
  },
})
export class ListItemAvatar {
  private readonly _elementRef = inject(ElementRef);
}
