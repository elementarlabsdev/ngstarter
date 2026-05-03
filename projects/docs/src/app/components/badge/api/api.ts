import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row,
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'ngsBadge',
      description: 'The content to be displayed in the badge',
      type: 'any',
      default: 'null'
    },
    {
      name: 'ngsBadgeColor',
      description: 'The color of the badge',
      type: 'string',
      default: 'primary'
    },
    {
      name: 'ngsBadgeOverlap',
      description: 'Whether the badge should overlap its content',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'ngsBadgeDisabled',
      description: 'Whether the badge is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'ngsBadgePosition',
      description: 'The position of the badge relative to the host element',
      type: 'BadgePosition',
      default: 'above after'
    },
    {
      name: 'ngsBadgeSize',
      description: 'The size of the badge',
      type: 'BadgeSize',
      default: 'medium'
    },
    {
      name: 'ngsBadgeHidden',
      description: 'Whether the badge is hidden',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'ngsBadgeDescription',
      description: 'A description of the badge for accessibility',
      type: 'string',
      default: "''"
    }
  ];
}
