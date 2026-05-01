import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicAlertExample } from '../_examples/basic-alert-example/basic-alert-example';
import { AlertVariantsExample } from '../_examples/alert-variants-example/alert-variants-example';
import { AlertWithIconExample } from '../_examples/alert-with-icon-example/alert-with-icon-example';
import {
  AlertWithTitleExample
} from '../_examples/alert-with-title-example/alert-with-title-example';
import { AlertActionsExample } from '../_examples/alert-actions-example/alert-actions-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Divider } from '@ngstarter-ui/components/divider';
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
} from '@ngstarter-ui/components/table';

@Component({
  imports: [
    Playground,
    BasicAlertExample,
    AlertVariantsExample,
    AlertWithIconExample,
    AlertWithTitleExample,
    AlertActionsExample,
    Page,
    PageContentDirective,
    TabGroup,
    Tab,
    PageTitleDirective,
    Divider,
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
      name: 'autoClose',
      description: 'Number of milliseconds to auto-close',
      type: 'number',
      default: '–'
    },
    {
      name: 'bordered',
      description: 'Bordered variant of an alert',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'variant',
      description: 'Colored variant of an alert',
      type: 'AlertVariant | string',
      default: 'default'
    }
  ];
  events = [
    {
      name: 'closed',
      description: 'Executed when the alert closes'
    }
  ];
}
