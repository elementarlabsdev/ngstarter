import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicGaugeExample } from '../_examples/basic-gauge-example/basic-gauge-example';
import {
  GaugeWithValueExample
} from '../_examples/gauge-with-value-example/gauge-with-value-example';
import {
  GaugeCustomSizeExample
} from '../_examples/gauge-custom-size-example/gauge-custom-size-example';
import {
  GaugeCustomStrokeWidthExample
} from '../_examples/gauge-custom-stroke-width-example/gauge-custom-stroke-width-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  Table,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  Cell,
  CellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef
} from '@ngstarter/components/table';

@Component({
  imports: [
    Playground,
    BasicGaugeExample,
    GaugeWithValueExample,
    GaugeCustomSizeExample,
    GaugeCustomStrokeWidthExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Table,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    Cell,
    CellDef,
    HeaderRow,
    HeaderRowDef,
    Row,
    RowDef
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  properties = [
    {
      name: 'value',
      description: 'Shows the percentage progress',
      type: 'number',
      default: '0'
    },
    {
      name: 'strokeWidth',
      description: 'Stroke width',
      type: 'number',
      default: '10'
    },
    {
      name: 'radius',
      description: 'Radius',
      type: 'number',
      default: '50'
    }
  ];
}
