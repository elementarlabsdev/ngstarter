import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicScreenLoaderExample
} from '../_examples/basic-screen-loader-example/basic-screen-loader-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  Table,
  ColumnDef,
  HeaderCellDef,
  HeaderCell,
  CellDef,
  Cell,
  HeaderRowDef,
  HeaderRow,
  RowDef,
  Row
} from '@ngstarter/components/table';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicScreenLoaderExample,
    PageTitleDirective,
    Table,
    ColumnDef,
    HeaderCellDef,
    HeaderCell,
    CellDef,
    Cell,
    HeaderRowDef,
    HeaderRow,
    RowDef,
    Row
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  displayedColumns: string[] = ['prop', 'type', 'default'];
  dataSource = [
    {
      prop: 'opened',
      description: 'Show/Hide screen loader',
      type: 'boolean',
      default: 'false'
    }
  ];
}
