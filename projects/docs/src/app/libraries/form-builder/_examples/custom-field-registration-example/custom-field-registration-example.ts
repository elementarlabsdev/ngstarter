import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormBuilderSchema,
  provideFormBuilderField
} from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-custom-field-registration-example',
  imports: [
    FormBuilder
  ],
  providers: [
    provideFormBuilderField({
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
      settings: {
        extends: 'field',
        schema: {
          sections: [
            {
              id: 'priority-settings',
              title: 'Priority labels',
              fields: [
                { id: 'priority-low-label', name: 'settings.lowLabel', type: 'text', label: 'Low label', defaultValue: 'Low' },
                { id: 'priority-medium-label', name: 'settings.mediumLabel', type: 'text', label: 'Medium label', defaultValue: 'Medium' },
                { id: 'priority-high-label', name: 'settings.highLabel', type: 'text', label: 'High label', defaultValue: 'High' }
              ]
            }
          ]
        }
      }
    })
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
