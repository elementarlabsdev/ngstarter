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
  passwordStrengthProperties = [
    {
      name: 'password<sup>*</sup>',
      description: 'The password value to check strength for',
      type: 'any',
      default: '–'
    },
    {
      name: 'externalError',
      description: 'External error state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'enableLengthRule',
      description: 'Whether to enable length rule',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'enableLowerCaseLetterRule',
      description: 'Whether to enable lower case letter rule',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'enableUpperCaseLetterRule',
      description: 'Whether to enable upper case letter rule',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'enableDigitRule',
      description: 'Whether to enable digit rule',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'enableSpecialCharRule',
      description: 'Whether to enable special character rule',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'min',
      description: 'Minimum number of characters',
      type: 'number',
      default: '8'
    },
    {
      name: 'max',
      description: 'Maximum number of characters',
      type: 'number',
      default: '30'
    },
    {
      name: 'customValidator',
      description: 'Custom validator RegExp',
      type: 'RegExp',
      default: '–'
    },
    {
      name: 'warnThreshold',
      description: 'Threshold for warning state',
      type: 'number',
      default: '21'
    },
    {
      name: 'accentThreshold',
      description: 'Threshold for accent state',
      type: 'number',
      default: '81'
    }
  ];

  passwordStrengthEvents = [
    {
      name: 'strengthChanged',
      description: 'Emitted when password strength changes'
    }
  ];

  passwordStrengthInfoProperties = [
    {
      name: 'passwordComponent<sup>*</sup>',
      description: 'Reference to the PasswordStrength component',
      type: 'PasswordStrength',
      default: '–'
    },
    {
      name: 'enableScoreInfo',
      description: 'Whether to show score info',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'lowerCaseCriteriaMessage',
      description: 'Message for lower case criteria',
      type: 'string',
      default: 'contains at least one lower character'
    },
    {
      name: 'upperCaseCriteriaMessage',
      description: 'Message for upper case criteria',
      type: 'string',
      default: 'contains at least one upper character'
    },
    {
      name: 'digitsCriteriaMessage',
      description: 'Message for digits criteria',
      type: 'string',
      default: 'contains at least one digit character'
    },
    {
      name: 'specialCharsCriteriaMessage',
      description: 'Message for special characters criteria',
      type: 'string',
      default: 'contains at least one special character'
    },
    {
      name: 'customCharsCriteriaMessage',
      description: 'Message for custom characters criteria',
      type: 'string',
      default: 'contains at least one custom character'
    },
    {
      name: 'minCharsCriteriaMessage',
      description: 'Message for minimum characters criteria',
      type: 'string',
      default: 'contains at least minimum characters'
    },
    {
      name: 'ngsIconDone',
      description: 'Icon for done state',
      type: 'string',
      default: 'checkmark-24-regular'
    },
    {
      name: 'ngsIconError',
      description: 'Icon for error state',
      type: 'string',
      default: 'error-circle-24-regular'
    }
  ];

  passToggleVisibilityProperties = [
    {
      name: 'visible',
      description: 'Initial visibility state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'tabindex',
      description: 'Tabindex for the toggle button',
      type: 'string',
      default: "''"
    }
  ];
}
