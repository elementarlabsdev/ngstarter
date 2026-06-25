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
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'image',
      description: 'The URL of the image to display',
      type: 'string',
      default: "''"
    },
    {
      name: 'variant',
      description: 'The visual variant of the avatar',
      type: 'AvatarVariant',
      default: "''"
    },
    {
      name: 'label',
      description: 'The text label to display (initials)',
      type: 'string',
      default: "''"
    },
    {
      name: 'key',
      description: 'Stable key used to generate deterministic avatar placeholders',
      type: 'string | number | null | undefined',
      default: "''"
    },
    {
      name: 'preset',
      description: 'Generated placeholder preset to render when image is not provided',
      type: "'identicon' | 'initials' | string",
      default: "''"
    },
    {
      name: 'backgroundColors',
      description: 'HEX background color palette used by generated avatar presets',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'foregroundColors',
      description: 'HEX foreground color palette used by generated identicon patterns',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'alt',
      description: 'Accessibility label for the image',
      type: 'string',
      default: "''"
    },
    {
      name: 'clickable',
      description: 'Whether the avatar is clickable',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'automaticColor',
      description: 'HEX color for automatic background and text color generation',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'presenceIndicator',
      description: 'The presence status indicator',
      type: 'AvatarPresenceIndicator',
      default: 'null'
    }
  ];
}
