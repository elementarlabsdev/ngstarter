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
  properties = [
    {
      name: 'value',
      description: 'The typed signature text.',
      type: 'model&lt;string&gt;',
      default: "''"
    },
    {
      name: 'fontFamily',
      description: 'The font family used to render the typed signature.',
      type: 'model&lt;string&gt;',
      default: 'Brush Script MT, Segoe Script, cursive'
    },
    {
      name: 'penColor',
      description: 'The color used to render the typed signature.',
      type: 'model&lt;string&gt;',
      default: '#000'
    },
    {
      name: 'placeholder',
      description: 'Placeholder text shown before the user types.',
      type: 'string',
      default: 'Type signature'
    },
    {
      name: 'colors',
      description: 'The available colors in the color switcher.',
      type: 'string[]',
      default: "['#000', '#0059ff', '#ff0000']"
    },
    {
      name: 'fonts',
      description: 'The available font choices in the font menu.',
      type: 'readonly TypedSignatureFont[]',
      default: 'Signature, Handwritten, Script, Classic'
    }
  ];

  events = [
    {
      name: 'signatureSaved',
      description: 'Emitted with the rendered typed signature SVG data URL.',
      type: 'string'
    },
    {
      name: 'signatureTyped',
      description: 'Emitted with the typed value, font family, color, and SVG data URL.',
      type: 'TypedSignaturePadValue'
    },
    {
      name: 'signatureCleared',
      description: 'Emitted when the typed signature is cleared.',
      type: 'void'
    }
  ];

  interfaces = [
    {
      name: 'TypedSignatureFont',
      description: 'A font option shown in the font menu.',
      shape: 'readonly label: string; readonly family: string;'
    },
    {
      name: 'TypedSignaturePadValue',
      description: 'The typed signature payload emitted by signatureTyped.',
      shape: 'readonly value: string; readonly fontFamily: string; readonly color: string; readonly dataUrl: string;'
    }
  ];
}
