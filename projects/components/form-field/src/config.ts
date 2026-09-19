import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';

export type FormFieldLabelMode = 'external' | 'floating';

export interface FormFieldConfig {
  labelMode?: FormFieldLabelMode;
}

export const FORM_FIELD_DEFAULT_CONFIG: Required<FormFieldConfig> = {
  labelMode: 'external',
};

export const FORM_FIELD_CONFIG = new InjectionToken<Required<FormFieldConfig>>(
  'FORM_FIELD_CONFIG',
  {
    factory: () => FORM_FIELD_DEFAULT_CONFIG,
  },
);

export function provideFormField(config: FormFieldConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FORM_FIELD_CONFIG,
      useValue: {
        ...FORM_FIELD_DEFAULT_CONFIG,
        ...config,
      },
    },
  ]);
}
