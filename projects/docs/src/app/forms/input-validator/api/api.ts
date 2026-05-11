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
      name: 'creditCardNumberValidator',
      description: 'Validator function for credit card numbers. Cleans non-digits, checks length, and validates the Luhn checksum. Returns creditCardNumberInvalid.',
      type: 'ValidatorFn',
      default: '-'
    },
    {
      name: 'expiryDateValidator',
      description: 'Validator function for credit card expiry date in MMYY format. Rejects invalid months and dates in the past. Returns expiryDateInvalid or expiryDateInPast.',
      type: 'ValidatorFn',
      default: '-'
    },
    {
      name: 'creditCardCvvValidator',
      description: 'Validator function for numeric CVV/CVC values. Defaults to 3–4 digits and accepts optional minLength and maxLength. Returns creditCardCvvInvalid.',
      type: 'ValidatorFn',
      default: '-'
    }
  ];
}
