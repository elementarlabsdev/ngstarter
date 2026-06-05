import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'ngs-chip-set',
  exportAs: 'ngsChipSet',
  templateUrl: './chip-set.html',
  styleUrl: './chip-set.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-chip-set',
    'role': 'presentation',
  },
})
export class ChipSet {
}
