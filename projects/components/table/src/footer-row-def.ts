import { Directive, forwardRef } from '@angular/core';
import { CdkFooterRowDef } from '@angular/cdk/table';

/** Footer row definition for the ngs-table. */
@Directive({
  selector: '[ngsFooterRowDef]',
  standalone: true,
  providers: [{provide: CdkFooterRowDef, useExisting: forwardRef(() => FooterRowDef)}],
  inputs: ['columns: ngsFooterRowDef', 'sticky: ngsFooterRowDefSticky'],
})
export class FooterRowDef extends CdkFooterRowDef {}
