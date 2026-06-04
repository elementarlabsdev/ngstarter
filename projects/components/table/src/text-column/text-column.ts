import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkTextColumn } from '@angular/cdk/table';
import { ColumnDef } from '../column-def';
import { CellDef } from '../cell-def';
import { HeaderCellDef } from '../header-cell-def';
import { HeaderCell } from '../header-cell/header-cell';
import { Cell } from '../cell/cell';

/**
 * Column that simply shows text content for the header and row cells. Assumes that the table
 * is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the same as the data property that it should show.
 * The header can be overridden by setting the `headerText` input.
 *
 * Example usage:
 * <table ngs-table [dataSource]="dataSource">
 *   <ngs-text-column name="userName"></ngs-text-column>
 *   <tr ngs-header-row *ngsHeaderRowDef="['userName']"></tr>
 *   <tr ngs-row *ngsRowDef="['userName']"></tr>
 * </table>
 */
@Component({
  selector: 'ngs-text-column',
  exportAs: 'ngsTextColumn',
  imports: [
    ColumnDef,
    HeaderCellDef,
    HeaderCell,
    CellDef,
    Cell
  ],
  templateUrl: './text-column.html',
  styleUrl: './text-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-text-column',
  }
})
export class TextColumn<T> extends CdkTextColumn<T> {}
