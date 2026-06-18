import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  ScrollSpyBackToTop,
  ScrollSpyNav,
  ScrollSpyOn,
  ScrollSpyTitle,
} from '@ngstarter-ui/components/scroll-spy';

@Component({
  selector: 'app-form-builder-custom-field',
  imports: [
    Button,
    Card,
    CardContent,
    Chip,
    ChipSet,
    CodeHighlighter,
    Icon,
    RouterLink,
    ScrollSpyBackToTop,
    ScrollSpyNav,
    ScrollSpyOn,
    ScrollSpyTitle,
  ],
  templateUrl: './form-builder-custom-field.html',
  styleUrl: './form-builder-custom-field.scss',
})
export class FormBuilderCustomField {
  readonly importCode = `import {
  FormBuilder,
  FormBuilderField,
  FormBuilderSchema,
  provideFormBuilderField,
} from '@ngstarter-ui/components/form-builder';`;

  readonly rendererCode = `import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter-ui/components/button-toggle';
import { FormBuilderField } from '@ngstarter-ui/components/form-builder';

@Component({
  selector: 'app-priority-field',
  imports: [ReactiveFormsModule, ButtonToggle, ButtonToggleGroup],
  template: \`
    <label>{{ field().label }}</label>
    <ngs-button-toggle-group [formControl]="control()">
      <ngs-button-toggle value="low">{{ field().settings?.['lowLabel'] || 'Low' }}</ngs-button-toggle>
      <ngs-button-toggle value="medium">{{ field().settings?.['mediumLabel'] || 'Medium' }}</ngs-button-toggle>
      <ngs-button-toggle value="high">{{ field().settings?.['highLabel'] || 'High' }}</ngs-button-toggle>
    </ngs-button-toggle-group>
  \`,
})
export class PriorityField {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
}`;

  readonly providerCode = `providers: [
  provideFormBuilderField({
    type: 'priority',
    label: 'Priority',
    group: 'Workflow',
    icon: 'fluent:flag-24-regular',
    defaults: {
      label: 'Priority',
      width: 6,
      defaultValue: 'medium',
      settings: {
        lowLabel: 'Low',
        mediumLabel: 'Medium',
        highLabel: 'High',
      },
    },
    renderer: () =>
      import('./priority-field/priority-field').then(c => c.PriorityField),
  }),
]`;

  readonly settingsCode = `provideFormBuilderField({
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
      highLabel: 'High',
    },
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
            { id: 'priority-low-label', name: 'settings.lowLabel', type: 'text', label: 'Low label' },
            { id: 'priority-medium-label', name: 'settings.mediumLabel', type: 'text', label: 'Medium label' },
            { id: 'priority-high-label', name: 'settings.highLabel', type: 'text', label: 'High label' },
          ],
        },
      ],
    },
  },
})`;

  readonly schemaCode = `readonly schema = signal<FormBuilderSchema>({
  title: 'Support request',
  sections: [
    {
      id: 'request',
      title: 'Request',
      fields: [
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
            highLabel: 'High',
          },
        },
      ],
    },
  ],
});`;

  readonly builderCode = `<ngs-form-builder [(schema)]="schema" />`;
}
