import { Directive, forwardRef } from '@angular/core';
import { CdkCellDef } from '@angular/cdk/table';

/** Cell definition for the ngs-table. */
@Directive({
  selector: '[ngsCellDef]',
  standalone: true,
  providers: [{provide: CdkCellDef, useExisting: forwardRef(() => CellDef)}],
})
export class CellDef extends CdkCellDef {}
