import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'ngs-chip-set',
  templateUrl: './chip-set.html',
  styleUrl: './chip-set.scss',
  host: {
    'class': 'ngs-chip-set',
    'role': 'presentation',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSet {
}
