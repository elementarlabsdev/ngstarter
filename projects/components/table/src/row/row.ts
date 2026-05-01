import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import {
  CdkCellOutlet,
  CdkRow
} from '@angular/cdk/table';

/** Data row template container that adds the right classes and role. */
@Component({
  selector: 'ngs-row, [ngs-row], tr[ngs-row]',
  templateUrl: './row.html',
  styleUrl: './row.scss',
  host: {
    'class': 'ngs-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CdkCellOutlet],
  providers: [{provide: CdkRow, useExisting: forwardRef(() => Row)}],
})
export class Row extends CdkRow {}
