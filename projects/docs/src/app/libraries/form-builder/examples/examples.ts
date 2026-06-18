import { Component, signal } from '@angular/core';
import { FormBuilder, FormBuilderSchema } from '@ngstarter-ui/components/form-builder';

@Component({
  imports: [
    FormBuilder
  ],
  templateUrl: './examples.html',
  styleUrl: './examples.scss'
})
export class Examples {
  schema = signal<FormBuilderSchema>({
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
            type: 'group',
            label: 'Invoice items',
            width: 12,
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
              }
            ]
          }
        ]
      }
    ]
  });
}
