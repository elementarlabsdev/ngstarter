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
})
export class Api {
  colorPickerProperties = [
    {
      name: 'color',
      description: 'The selected color as a string.',
      type: 'string',
      default: "''"
    },
    {
      name: 'disabled',
      description: 'Whether the color picker is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'asDropdown',
      description: 'Whether the color picker is rendered as a dropdown.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showOpacity',
      description: 'Whether to show the opacity slider.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'resultFormat',
      description: "The format of the color result ('rgb', 'hex', 'hsl', etc.).",
      type: 'ColorPickerResultFormat',
      default: "'rgb'"
    }
  ];

  colorPickerEvents = [
    {
      name: 'colorChange',
      description: 'Emitted when the selected color changes.',
      type: 'string'
    },
    {
      name: 'rawColorChange',
      description: 'Emitted when the raw color (TinyColor) changes.',
      type: 'TinyColor'
    }
  ];

  triggerProperties = [
    {
      name: 'ngsColorPickerTriggerFor',
      description: 'The template reference of the color picker to be triggered.',
      type: 'TemplateRef<any>',
      default: '–'
    },
    {
      name: 'position',
      description: 'The position of the color picker popover relative to the trigger.',
      type: 'ColorPickerPosition',
      default: "'below-center'"
    }
  ];

  triggerEvents = [
    {
      name: 'opened',
      description: 'Emitted when the color picker popover is opened.',
      type: 'void'
    },
    {
      name: 'closed',
      description: 'Emitted when the color picker popover is closed.',
      type: 'void'
    }
  ];

  thumbnailProperties = [
    {
      name: 'color',
      description: 'The color to display in the thumbnail.',
      type: 'string',
      default: "''"
    }
  ];
}
