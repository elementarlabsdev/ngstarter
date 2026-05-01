import { Directive, forwardRef } from '@angular/core';
import { CdkNoDataRow } from '@angular/cdk/table';

/** Row that can be used to display a message when no data is shown in the table. */
@Directive({
  selector: 'ng-template[ngsNoDataRow]',
  standalone: true,
  providers: [{provide: CdkNoDataRow, useExisting: forwardRef(() => NoDataRow)}],
})
export class NoDataRow extends CdkNoDataRow {
}
