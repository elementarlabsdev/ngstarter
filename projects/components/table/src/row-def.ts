import { Directive, forwardRef } from '@angular/core';
import { CdkRowDef } from '@angular/cdk/table';

/** Data row definition for the ngs-table. */
@Directive({
  selector: '[ngsRowDef]',
  standalone: true,
  providers: [{provide: CdkRowDef, useExisting: forwardRef(() => RowDef)}],
  inputs: ['columns: ngsRowDefColumns', 'when: ngsRowDefWhen'],
})
export class RowDef<T> extends CdkRowDef<T> {}
