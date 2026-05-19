import { Directive } from '@angular/core';

@Directive({
  selector: 'ngs-chip-avatar, [ngsChipAvatar]',
  exportAs: 'ngsChipAvatar',
  host: {
    'class': 'ngs-chip-avatar',
  },
})
export class ChipAvatar {}
