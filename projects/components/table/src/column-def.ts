import { Directive, forwardRef } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';

/**
 * Column definition for the ngs-table.
 * Defines a set of cells available for a table column.
 */
@Directive({
  selector: '[ngsColumnDef]',
  standalone: true,
  providers: [{provide: CdkColumnDef, useExisting: forwardRef(() => ColumnDef)}],
  inputs: ['name: ngsColumnDef'],
})
export class ColumnDef extends CdkColumnDef {}
