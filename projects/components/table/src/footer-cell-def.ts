import { Directive, forwardRef } from '@angular/core';
import { CdkFooterCellDef } from '@angular/cdk/table';

/** Footer cell definition for the ngs-table. */
@Directive({
  selector: '[ngsFooterCellDef]',
  standalone: true,
  providers: [{provide: CdkFooterCellDef, useExisting: forwardRef(() => FooterCellDef)}],
})
export class FooterCellDef extends CdkFooterCellDef {}
