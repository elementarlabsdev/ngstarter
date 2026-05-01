import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import {
  CdkCellOutlet,
  CdkFooterRow
} from '@angular/cdk/table';

/** Footer template container that adds the right classes and role. */
@Component({
  selector: 'ngs-footer-row, [ngs-footer-row], tr[ngs-footer-row]',
  templateUrl: './footer-row.html',
  styleUrl: './footer-row.scss',
  host: {
    'class': 'ngs-footer-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [CdkCellOutlet],
  providers: [{provide: CdkFooterRow, useExisting: forwardRef(() => FooterRow)}],
})
export class FooterRow extends CdkFooterRow {
}
