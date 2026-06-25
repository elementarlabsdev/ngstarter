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
      name: 'appearance',
      description: 'Avatar appearance. Use default for normal image, label, or icon avatars, and identicon or initials for generated key-based placeholders',
      type: "'default' | 'identicon' | 'initials' | string",
      default: "'default'"
    },
    {
      name: 'backgroundColors',
      description: 'HEX background color palette used by generated avatar appearances',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'foregroundColors',
      description: 'HEX foreground color palette used by generated avatar appearances',
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

  configProperties = [
    {
      name: 'appearance',
      description: 'Default avatar appearance used when an avatar does not set its own appearance input',
      type: "'default' | 'identicon' | 'initials' | string",
      default: "'default'"
    }
  ];
}
