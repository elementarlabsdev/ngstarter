import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormRenderer, FormBuilderSchema, FormBuilderUploadCallback } from '@ngstarter-ui/components/form-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';

@Component({
  selector: 'app-form-builder-renderer-example',
  imports: [
    JsonPipe,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormRenderer
  ],
  templateUrl: './form-builder-renderer-example.html',
  styleUrl: './form-builder-renderer-example.scss'
})
export class FormBuilderRendererExample {
  readonly value = signal<Record<string, any>>({
    company: 'Elementar Labs',
    company_logo: {
      name: 'solo-logo.svg',
      size: 42000,
      type: 'image/svg+xml'
    },
    currency: 'usd',
    seats: 12,
    seat_price: 24,
    contact_name: 'Alex Morgan',
    contact_email: 'alex@example.com'
  });
  readonly submittedValue = signal<Record<string, any> | null>(null);

  readonly schema: FormBuilderSchema = {
    title: 'Billing profile',
    sections: [
      {
        id: 'company',
        title: 'Company',
        description: 'Fields rendered from a saved builder schema.',
        fields: [
          {
            id: 'company',
            name: 'company',
            type: 'text',
            label: 'Company',
            placeholder: 'Company name',
            required: true,
            width: 6
          },
          {
            id: 'account_id',
            name: 'account_id',
            type: 'hidden',
            label: 'Account ID',
            defaultValue: 'acct_1024'
          },
          {
            id: 'billing_email',
            name: 'billing_email',
            type: 'email',
            label: 'Billing email',
            placeholder: 'finance@example.com',
            required: true,
            width: 6
          },
          {
            id: 'company_logo',
            name: 'company_logo',
            type: 'logo-upload',
            label: 'Logo Upload',
            placeholder: 'Logo Upload',
            width: 12
          },
          {
            id: 'currency',
            name: 'currency',
            type: 'select',
            label: 'Currency',
            width: 6,
            options: [
              { label: 'US Dollar', value: 'usd' },
              { label: 'Euro', value: 'eur' },
              { label: 'Polish Zloty', value: 'pln' }
            ]
          },
          {
            id: 'seats',
            name: 'seats',
            type: 'number',
            label: 'Seats',
            width: 3,
            defaultValue: 1
          },
          {
            id: 'seat_price',
            name: 'seat_price',
            type: 'currency',
            label: 'Seat price',
            width: 3,
            defaultValue: 24
          },
          {
            id: 'monthly_total',
            name: 'monthly_total',
            type: 'calculated',
            label: 'Monthly total',
            width: 6,
            settings: {
              expression: 'ROUND(seats * seat_price, 2)',
              valueType: 'number',
              precision: 2,
              emptyValue: ''
            }
          },
          {
            id: 'notes',
            name: 'notes',
            type: 'textarea',
            label: 'Internal notes',
            placeholder: 'Add context for finance team',
            width: 12
          },
          {
            id: 'contacts',
            name: 'contacts',
            type: 'group',
            label: 'Billing contacts',
            width: 12,
            children: [
              {
                id: 'contact_name',
                name: 'contact_name',
                type: 'text',
                label: 'Contact name',
                placeholder: 'Full name',
                width: 6
              },
              {
                id: 'contact_email',
                name: 'contact_email',
                type: 'email',
                label: 'Contact email',
                placeholder: 'name@example.com',
                width: 6
              }
            ]
          }
        ]
      }
    ]
  };

  readonly uploadCallback: FormBuilderUploadCallback = ({ files }) => {
    const file = files[0];

    return file
      ? {
          name: file.name,
          size: file.size,
          type: file.type
        }
      : null;
  };
}
