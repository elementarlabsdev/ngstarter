import { Directive } from '@angular/core';

@Directive({
  selector: 'ngs-chip-avatar, [ngsChipAvatar]',
  host: {
    'class': 'ngs-chip-avatar',
  },
  standalone: true,
})
export class ChipAvatar {}
