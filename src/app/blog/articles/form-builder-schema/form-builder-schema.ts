import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
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
  selector: 'app-form-builder-schema',
  imports: [
    Button,
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
  templateUrl: './form-builder-schema.html',
  styleUrl: './form-builder-schema.scss',
})
export class FormBuilderSchemaArticle {
  readonly schemaCode = `const schema: FormBuilderSchema = {
  title: 'Customer intake',
  fields: [
    {
      id: 'source',
      name: 'source',
      type: 'select',
      label: 'Source',
      width: 6,
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Referral', value: 'referral' },
      ],
    },
  ],
  sections: [
    {
      id: 'contact',
      title: 'Contact',
      description: 'Basic customer contact details.',
      fields: [
        {
          id: 'email',
          name: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'name@example.com',
          required: true,
          width: 6,
        },
      ],
    },
  ],
  layout: [
    { kind: 'field', id: 'source' },
    { kind: 'section', id: 'contact' },
  ],
};`;

  readonly fieldCode = `{
  id: 'email',
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'name@example.com',
  hint: 'Used for account notifications.',
  defaultValue: '',
  required: true,
  width: 6,
  validation: [
    { type: 'email', message: 'Use a valid email address.' },
  ],
  visibility: {
    form: true,
    email: true,
    pdf: true,
  },
}`;

  readonly layoutCode = `layout: [
  { kind: 'field', id: 'source' },
  { kind: 'section', id: 'contact' },
];`;

  readonly optionCode = `options: [
  { label: 'Starter', value: 'starter' },
  { label: 'Growth', value: 'growth', selected: true },
  { label: 'Enterprise', value: 'enterprise' },
]`;

  readonly nestedCode = `{
  id: 'team-members',
  name: 'teamMembers',
  type: 'repeater',
  kind: 'layout',
  label: 'Team members',
  width: 12,
  settings: {
    allowNullValue: false,
    emptyText: 'No team members yet.',
  },
  children: [
    { id: 'member-name', name: 'name', type: 'text', label: 'Name', width: 6 },
    { id: 'member-email', name: 'email', type: 'email', label: 'Email', width: 6 },
  ],
}`;
}
