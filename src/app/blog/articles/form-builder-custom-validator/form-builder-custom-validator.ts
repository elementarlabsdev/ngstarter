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
  selector: 'app-form-builder-custom-validator',
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
  templateUrl: './form-builder-custom-validator.html',
  styleUrl: './form-builder-custom-validator.scss',
})
export class FormBuilderCustomValidatorArticle {
  readonly importsCode = `import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  FormBuilderSchema,
  FormBuilderValidatorDefinition,
  provideFormBuilderValidator,
  provideFormBuilderValidators,
} from '@ngstarter-ui/components/form-builder';`;

  readonly validatorCode = `export const SKU_PREFIX_VALIDATOR: FormBuilderValidatorDefinition = {
  type: 'skuPrefix',
  label: 'SKU prefix',
  description: 'Requires the value to start with a configured product prefix.',
  errorKey: 'skuPrefix',
  valueType: 'text',
  valueLabel: 'Prefix',
  valuePlaceholder: 'SKU-',
  requiresValue: true,
  defaultValue: 'SKU-',
  defaultMessage: 'Value must start with {value}.',
  validator: rule => {
    const prefix = String(rule.value ?? '');

    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');

      if (!value || value.startsWith(prefix)) {
        return null;
      }

      return {
        skuPrefix: {
          requiredPrefix: prefix,
          actual: value,
        },
      };
    };
  },
};`;

  readonly appConfigCode = `import { ApplicationConfig } from '@angular/core';
import { provideFormBuilderValidator } from '@ngstarter-ui/components/form-builder';
import { SKU_PREFIX_VALIDATOR } from './validators/sku-prefix.validator';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormBuilderValidator(SKU_PREFIX_VALIDATOR),
  ],
};`;

  readonly multipleProvidersCode = `provideFormBuilderValidators([
  SKU_PREFIX_VALIDATOR,
  {
    type: 'startsWithProject',
    label: 'Project prefix',
    errorKey: 'startsWithProject',
    valueType: 'text',
    requiresValue: true,
    defaultValue: 'PRJ-',
    defaultMessage: 'Project codes must start with {value}.',
    validator: rule => control => {
      const prefix = String(rule.value ?? '');
      const value = String(control.value ?? '');

      return !value || value.startsWith(prefix)
        ? null
        : { startsWithProject: true };
    },
  },
]);`;

  readonly provideFormBuilderCode = `provideFormBuilder({
  validators: [
    SKU_PREFIX_VALIDATOR,
  ],
});`;

  readonly schemaCode = `readonly schema: FormBuilderSchema = {
  title: 'Product setup',
  sections: [
    {
      id: 'product',
      title: 'Product',
      fields: [
        {
          id: 'sku',
          name: 'sku',
          type: 'text',
          label: 'SKU',
          placeholder: 'SKU-001',
          width: 6,
          validation: [
            {
              type: 'required',
              message: 'SKU is required.',
            },
            {
              type: 'skuPrefix',
              value: 'SKU-',
              message: 'SKU must start with SKU-.',
            },
          ],
        },
      ],
    },
  ],
};`;

  readonly templateCode = `<ngs-form-builder [(schema)]="schema" />

<ngs-form-renderer
  [schema]="schema"
  (formSubmit)="saveProduct($event)" />`;
}
