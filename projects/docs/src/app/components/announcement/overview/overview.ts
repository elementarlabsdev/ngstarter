import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicAnnouncementExample
} from '../_examples/basic-announcement-example/basic-announcement-example';
import {
  AnnouncementWithIconsExample
} from '../_examples/announcement-with-icons-example/announcement-with-icons-example';
import {
  AnnouncementWithTitleExample
} from '../_examples/announcement-with-title-example/announcement-with-title-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  ShowHideAnnouncementDynamically
} from '../_examples/show-hide-announcement-dynamically/show-hide-announcement-dynamically';
import { Tab, TabGroup } from '@ngstarter/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter/components/table';

@Component({
  imports: [
    Playground,
    BasicAnnouncementExample,
    AnnouncementWithIconsExample,
    AnnouncementWithTitleExample,
    Page,
    PageContentDirective,
    ShowHideAnnouncementDynamically,
    Tab,
    TabGroup,
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
      name: 'title',
      description: 'Title of an announcement',
      type: 'string',
      default: '–'
    },
    {
      name: 'iconName',
      description: 'Name of an icon',
      type: 'string',
      default: '–'
    },
    {
      name: 'AnnouncementVariant',
      description: 'Colored variant of an announcement',
      type: 'string',
      default: '–'
    }
  ];
  events = [
    {
      name: 'closed',
      description: 'Executed when the close button is clicked'
    }
  ];
}
