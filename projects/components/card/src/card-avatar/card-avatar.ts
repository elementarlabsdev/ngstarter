import { Directive } from '@angular/core';

@Directive({
  selector: 'ngs-card-avatar, [ngs-card-avatar], [ngsCardAvatar]',
  standalone: true,
  host: {
    'class': 'ngs-card-avatar'
  },
})
export class CardAvatar {}
