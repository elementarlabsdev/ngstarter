import { Component } from '@angular/core';
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
  chipProperties = [
    {
      name: 'appearance',
      description: 'The appearance of the chip.',
      type: 'string',
      default: 'filled'
    },
    {
      name: 'disabled',
      description: 'Whether the chip is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'value',
      description: 'The value of the chip.',
      type: 'any',
      default: 'undefined'
    }
  ];

  chipEvents = [
    {
      name: 'destroyed',
      description: 'Emitted when the chip is destroyed.',
    },
    {
      name: 'removed',
      description: 'Emitted when the chip is removed.',
    }
  ];

  chipCssTokens = [
    {
      name: '--ngs-chip-background',
      description: 'Background color used by filled chips and selected chip state. Use this token instead of the previous --ngs-chip-bg name.'
    },
    {
      name: '--ngs-chip-color',
      description: 'Text and icon color used by the chip.'
    },
    {
      name: '--ngs-chip-border-color',
      description: 'Border color used by outlined chips.'
    },
    {
      name: '--ngs-chip-selected-background',
      description: 'Background color applied when a chip option is selected.'
    },
    {
      name: '--ngs-chip-selected-color',
      description: 'Text and icon color applied when a chip option is selected.'
    }
  ];

  chipListboxProperties = [
    {
      name: 'multiple',
      description: 'Whether the chip listbox allows multiple selection.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the chip listbox is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];

  chipGridProperties = [
    {
      name: 'id',
      description: 'The unique ID of the chip grid.',
      type: 'string',
      default: 'ngs-chip-grid-x'
    },
    {
      name: 'placeholder',
      description: 'The placeholder for the chip grid.',
      type: 'string',
      default: '–'
    },
    {
      name: 'required',
      description: 'Whether the chip grid is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the chip grid is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];

  chipOptionProperties = [
    {
      name: 'selected',
      description: 'Whether the chip option is selected.',
      type: 'boolean',
      default: 'false'
    }
  ];

  chipOptionEvents = [
    {
      name: 'selectionChange',
      description: 'Emitted when the chip option selection state changes.',
    }
  ];

  chipRowProperties = [
    {
      name: 'editable',
      description: 'Whether the chip row is editable.',
      type: 'boolean',
      default: 'false'
    }
  ];

  chipRowEvents = [
    {
      name: 'edited',
      description: 'Emitted when the chip row value is edited.',
    }
  ];

  chipInputProperties = [
    {
      name: 'ngsChipInputFor',
      description: 'The chip grid that the input is associated with.',
      type: 'ChipGrid',
      default: '–'
    },
    {
      name: 'ngsChipInputSeparatorKeyCodes',
      description: 'The list of key codes that will trigger a chip input token end event.',
      type: 'number[] | ReadonlySet<number>',
      default: '–'
    },
    {
      name: 'ngsChipInputAddOnBlur',
      description: 'Whether to add a chip when the input loses focus.',
      type: 'boolean',
      default: 'false'
    }
  ];

  chipInputEvents = [
    {
      name: 'chipInputTokenEnd',
      description: 'Emitted when a chip input token end event is triggered.',
    }
  ];
}
