import { Directive, forwardRef } from '@angular/core';
import { CdkHeaderCellDef } from '@angular/cdk/table';

/** Header cell definition for the ngs-table. */
@Directive({
  selector: '[ngsHeaderCellDef]',
  standalone: true,
  providers: [{provide: CdkHeaderCellDef, useExisting: forwardRef(() => HeaderCellDef)}],
})
export class HeaderCellDef extends CdkHeaderCellDef {}
