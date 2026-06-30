import { Component, signal } from '@angular/core';
import { FormBuilder, FormBuilderSchema } from '@ngstarter-ui/components/form-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';

@Component({
  selector: 'app-basic-form-builder-example',
  imports: [
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CodeHighlighter,
    FormBuilder
  ],
  templateUrl: './basic-form-builder-example.html',
  styleUrl: './basic-form-builder-example.scss'
})
export class BasicFormBuilderExample {
  readonly schema = signal<FormBuilderSchema>({
    title: 'Invoice form',
    sections: [
      {
        id: 'invoice',
        title: 'Invoice details',
        fields: [
          {
            id: 'invoice_number',
            name: 'invoice_number',
            type: 'text',
            label: 'Invoice number',
            placeholder: 'INV-2026-001',
            required: true,
            width: 4
          },
          {
            id: 'invoice_date',
            name: 'invoice_date',
            type: 'date',
            label: 'Invoice date',
            required: true,
            width: 4
          },
          {
            id: 'due_date',
            name: 'due_date',
            type: 'date',
            label: 'Due date',
            required: true,
            width: 4
          }
        ]
      },
      {
        id: 'client',
        title: 'Client',
        fields: [
          {
            id: 'client_name',
            name: 'client_name',
            type: 'text',
            label: 'Client',
            placeholder: 'Acme LLC',
            width: 6
          },
          {
            id: 'client_email',
            name: 'client_email',
            type: 'email',
            label: 'Email',
            placeholder: 'billing@acme.test',
            width: 6
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        fields: [
          {
            id: 'invoice_items',
            name: 'invoice_items',
            type: 'repeater',
            kind: 'layout',
            label: 'Invoice items',
            width: 12,
            settings: {
              allowNullValue: false,
              emptyText: 'No invoice items yet.'
            },
            children: [
              {
                id: 'item_description',
                name: 'item_description',
                type: 'textarea',
                label: 'Description',
                placeholder: 'Service description',
                width: 12
              },
              {
                id: 'item_quantity',
                name: 'item_quantity',
                type: 'number',
                label: 'Quantity',
                width: 3,
                defaultValue: 1
              },
              {
                id: 'item_price',
                name: 'item_price',
                type: 'currency',
                label: 'Price',
                width: 3
              },
              {
                id: 'item_total',
                name: 'item_total',
                type: 'calculated',
                label: 'Line total',
                width: 3,
                settings: {
                  expression: 'ROUND(item_quantity * item_price, 2)',
                  valueType: 'number',
                  precision: 2,
                  emptyValue: ''
                }
              }
            ]
          },
          {
            id: 'invoice_total',
            name: 'invoice_total',
            type: 'calculated',
            label: 'Invoice total',
            width: 4,
            settings: {
              expression: 'ROUND(SUM(invoice_items.item_total), 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: ''
            }
          },
          {
            id: 'invoice_summary',
            name: 'invoice_summary',
            type: 'plain-text',
            kind: 'static',
            label: 'Invoice summary',
            width: 8,
            settings: {
              text: 'Estimated total: {count_total}',
              expression: true,
              expressions: [
                {
                  id: 'count_total',
                  expression: 'ROUND(SUM(invoice_items.item_total), 2)'
                }
              ]
            }
          }
        ]
      }
    ]
  });

  protected readonly schemaCode = () => JSON.stringify(this.schema(), null, 2);
}
