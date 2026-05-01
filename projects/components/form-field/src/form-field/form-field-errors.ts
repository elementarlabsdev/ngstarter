import { InjectionToken } from '@angular/core';

export interface FormFieldDefaultOptions {
  appearance?: 'fill' | 'outline';
  color?: string;
  hideRequiredMarker?: boolean;
  floatLabel?: 'always' | 'auto';
  subscriptHiddenIfEmpty?: boolean;
}

export const FORM_FIELD_DEFAULT_OPTIONS = new InjectionToken<FormFieldDefaultOptions>(
  'FORM_FIELD_DEFAULT_OPTIONS'
);
