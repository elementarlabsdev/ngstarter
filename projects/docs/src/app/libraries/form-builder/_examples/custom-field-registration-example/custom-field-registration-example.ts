import { Component, signal } from '@angular/core';
import {
  FORM_BUILDER_FIELDS,
  FormBuilder,
  FormBuilderSchema,
  formBuilderField
} from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-custom-field-registration-example',
  imports: [
    FormBuilder
  ],
  providers: [
    {
      provide: FORM_BUILDER_FIELDS,
      multi: true,
      useValue: formBuilderField({
        type: 'priority',
        label: 'Priority',
        group: 'Workflow',
        icon: 'fluent:flag-24-regular',
        defaults: {
          label: 'Priority',
          width: 6,
          settings: {
            lowLabel: 'Low',
            mediumLabel: 'Medium',
            highLabel: 'High'
          }
        },
        renderer: () =>
          import('./priority-field/priority-field').then(c => c.PriorityField),
        settings: () =>
          import('./priority-field-settings/priority-field-settings').then(c => c.PriorityFieldSettings)
      })
    }
  ],
  templateUrl: './custom-field-registration-example.html',
  styleUrl: './custom-field-registration-example.scss'
})
export class CustomFieldRegistrationExample {
  readonly schema = signal<FormBuilderSchema>({
    title: 'Support request',
    sections: [
      {
        id: 'request',
        title: 'Request',
        fields: [
          {
            id: 'subject',
            name: 'subject',
            type: 'text',
            label: 'Subject',
            width: 6,
            visibility: {
              form: true
            }
          },
          {
            id: 'priority',
            name: 'priority',
            type: 'priority',
            label: 'Priority',
            defaultValue: 'medium',
            width: 6,
            settings: {
              lowLabel: 'Low',
              mediumLabel: 'Medium',
              highLabel: 'High'
            },
            visibility: {
              form: true
            }
          }
        ]
      }
    ]
  });
}
