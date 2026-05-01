import { Directive, forwardRef } from '@angular/core';
import { CdkHeaderRowDef } from '@angular/cdk/table';

/** Header row definition for the ngs-table. */
@Directive({
  selector: '[ngsHeaderRowDef]',
  standalone: true,
  providers: [{provide: CdkHeaderRowDef, useExisting: forwardRef(() => HeaderRowDef)}],
  inputs: ['columns: ngsHeaderRowDef', 'sticky: ngsHeaderRowDefSticky'],
})
export class HeaderRowDef extends CdkHeaderRowDef {}
