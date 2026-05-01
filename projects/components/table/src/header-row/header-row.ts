import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import {
  CdkCellOutlet,
  CdkHeaderRow
} from '@angular/cdk/table';

/** Header template container that adds the right classes and role. */
@Component({
  selector: 'ngs-header-row, [ngs-header-row], tr[ngs-header-row]',
  templateUrl: './header-row.html',
  styleUrl: './header-row.scss',
  host: {
    'class': 'ngs-header-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CdkCellOutlet],
  providers: [{provide: CdkHeaderRow, useExisting: forwardRef(() => HeaderRow)}],
})
export class HeaderRow extends CdkHeaderRow {
}
