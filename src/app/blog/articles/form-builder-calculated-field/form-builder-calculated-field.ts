import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { FormBuilderSchema, FormRenderer } from '@ngstarter-ui/components/form-builder';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  ScrollSpyBackToTop,
  ScrollSpyNav,
  ScrollSpyOn,
  ScrollSpyTitle,
} from '@ngstarter-ui/components/scroll-spy';

@Component({
  selector: 'app-form-builder-calculated-field',
  imports: [
    Button,
    Card,
    CardContent,
    Chip,
    ChipSet,
    CodeHighlighter,
    FormRenderer,
    Icon,
    RouterLink,
    ScrollSpyBackToTop,
    ScrollSpyNav,
    ScrollSpyOn,
    ScrollSpyTitle,
  ],
  templateUrl: './form-builder-calculated-field.html',
  styleUrl: './form-builder-calculated-field.scss',
})
export class FormBuilderCalculatedFieldArticle {
  readonly calculatorValue = signal<Record<string, any>>({
    quantity: 8,
    unit_price: 49,
    discount_rate: 10,
    tax_rate: 8,
  });

  readonly calculatorSchema: FormBuilderSchema = {
    title: 'Quote calculator',
    sections: [
      {
        id: 'quote',
        title: 'Quote calculator',
        description: 'Change the editable inputs and the calculated fields update immediately.',
        fields: [
          {
            id: 'quantity',
            name: 'quantity',
            type: 'number',
            label: 'Quantity',
            width: 3,
            defaultValue: 8,
          },
          {
            id: 'unit-price',
            name: 'unit_price',
            type: 'currency',
            label: 'Unit price',
            width: 3,
            defaultValue: 49,
          },
          {
            id: 'discount-rate',
            name: 'discount_rate',
            type: 'number',
            label: 'Discount %',
            width: 3,
            defaultValue: 10,
          },
          {
            id: 'tax-rate',
            name: 'tax_rate',
            type: 'number',
            label: 'Tax %',
            width: 3,
            defaultValue: 8,
          },
          {
            id: 'subtotal',
            name: 'subtotal',
            type: 'calculated',
            label: 'Subtotal',
            width: 4,
            settings: {
              expression: 'ROUND(quantity * unit_price, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: '',
            },
          },
          {
            id: 'discount-amount',
            name: 'discount_amount',
            type: 'calculated',
            label: 'Discount amount',
            width: 4,
            settings: {
              expression: 'ROUND(subtotal * discount_rate / 100, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: '',
            },
          },
          {
            id: 'taxable-total',
            name: 'taxable_total',
            type: 'calculated',
            label: 'Taxable total',
            width: 4,
            settings: {
              expression: 'ROUND(subtotal - discount_amount, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: '',
            },
          },
          {
            id: 'tax-amount',
            name: 'tax_amount',
            type: 'calculated',
            label: 'Tax amount',
            width: 6,
            settings: {
              expression: 'ROUND(taxable_total * tax_rate / 100, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: '',
            },
          },
          {
            id: 'grand-total',
            name: 'grand_total',
            type: 'calculated',
            label: 'Grand total',
            width: 6,
            settings: {
              expression: 'ROUND(taxable_total + tax_amount, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: '',
            },
          },
        ],
      },
    ],
  };

  readonly minimalFieldCode = `{
  id: 'line_total',
  name: 'line_total',
  type: 'calculated',
  label: 'Line total',
  width: 4,
  settings: {
    expression: 'ROUND(quantity * unit_price, 2)',
    valueType: 'number',
    precision: 2,
    emptyValue: '',
  },
}`;

  readonly invoiceSchemaCode = `const schema: FormBuilderSchema = {
  title: 'Invoice',
  sections: [
    {
      id: 'line-item',
      title: 'Line item',
      fields: [
        {
          id: 'quantity',
          name: 'quantity',
          type: 'number',
          label: 'Quantity',
          defaultValue: 1,
          width: 4,
        },
        {
          id: 'unit_price',
          name: 'unit_price',
          type: 'currency',
          label: 'Unit price',
          defaultValue: 49,
          width: 4,
        },
        {
          id: 'line_total',
          name: 'line_total',
          type: 'calculated',
          label: 'Line total',
          width: 4,
          settings: {
            expression: 'ROUND(quantity * unit_price, 2)',
            valueType: 'number',
            precision: 2,
            emptyValue: '',
          },
        },
      ],
    },
  ],
};`;

  readonly rendererCode = `<ngs-form-renderer
  [schema]="schema"
  [(value)]="value"
  (formSubmit)="saveInvoice($event)" />`;

  readonly valueCode = `value = {
  quantity: 3,
  unit_price: 49,
  line_total: 147,
};`;

  readonly settingsCode = `settings: {
  expression: 'IF(discount > 0, subtotal - discount, subtotal)',
  valueType: 'number',
  precision: 2,
  emptyValue: '',
}`;

  readonly dependencyCode = `[
  {
    name: 'subtotal',
    type: 'calculated',
    settings: {
      expression: 'quantity * unit_price',
      valueType: 'number',
    },
  },
  {
    name: 'tax',
    type: 'calculated',
    settings: {
      expression: 'ROUND(subtotal * tax_rate, 2)',
      valueType: 'number',
      precision: 2,
    },
  },
  {
    name: 'total',
    type: 'calculated',
    settings: {
      expression: 'subtotal + tax',
      valueType: 'number',
      precision: 2,
    },
  },
]`;

  readonly repeaterCode = `{
  id: 'items',
  name: 'items',
  type: 'repeater',
  kind: 'layout',
  label: 'Items',
  children: [
    { id: 'quantity', name: 'quantity', type: 'number', label: 'Quantity' },
    { id: 'unit_price', name: 'unit_price', type: 'currency', label: 'Unit price' },
    {
      id: 'line_total',
      name: 'line_total',
      type: 'calculated',
      label: 'Line total',
      settings: {
        expression: 'ROUND(quantity * unit_price, 2)',
        valueType: 'number',
        precision: 2,
      },
    },
  ],
}`;

  readonly aggregateCode = `{
  id: 'invoice_total',
  name: 'invoice_total',
  type: 'calculated',
  label: 'Invoice total',
  settings: {
    expression: 'ROUND(SUM(items.line_total), 2)',
    valueType: 'number',
    precision: 2,
    emptyValue: '',
  },
}`;

  readonly plainTextCode = `{
  id: 'invoice_summary',
  name: 'invoice_summary',
  type: 'plain-text',
  kind: 'static',
  label: 'Invoice summary',
  settings: {
    text: 'Estimated total: {count_total}',
    expression: true,
    expressions: [
      {
        id: 'count_total',
        expression: 'ROUND(SUM(items.line_total), 2)',
      },
    ],
  },
}`;

  readonly customEngineCode = `import {
  FormBuilderCalculationEngine,
  provideFormBuilder,
} from '@ngstarter-ui/components/form-builder';

export const calculationEngine: FormBuilderCalculationEngine = {
  evaluate(expression, context) {
    if (expression === 'CURRENT_USER_DISCOUNT()') {
      return { value: context.values['customer_tier'] === 'enterprise' ? 0.15 : 0 };
    }

    return { value: null, error: 'Unsupported expression.' };
  },
  dependencies(expression) {
    return expression.includes('CURRENT_USER_DISCOUNT')
      ? ['customer_tier']
      : [];
  },
};

export const appConfig = {
  providers: [
    provideFormBuilder({
      calculationEngine,
    }),
  ],
};`;

  readonly formulaExamplesCode = `price * quantity
ROUND(price * quantity, 2)
IF(quantity > 10, price * quantity * 0.9, price * quantity)
SUM(subtotal, tax, shipping)
SUM(items.line_total)
AVG(items.score)
COUNT(items.line_total)
CONCAT(first_name, ' ', last_name)`;
}
