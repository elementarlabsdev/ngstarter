import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'password-strength',
    loadChildren: () => import('./password-strength/routes').then(m => m.routes),
    title: 'Password Strength'
  },
  {
    path: 'autocomplete',
    loadChildren: () => import('./autocomplete/routes').then(m => m.routes),
    title: 'Autocomplete'
  },
  {
    path: 'buttons',
    loadChildren: () => import('./buttons/routes').then(m => m.routes),
    title: 'Buttons'
  },
  {
    path: 'input',
    loadChildren: () => import('./input/routes').then(m => m.routes),
    title: 'Input'
  },
  {
    path: 'phone-input',
    loadChildren: () => import('./phone-input/routes').then(m => m.routes),
    title: 'Phone Input'
  },
  {
    path: 'slide-toggle',
    loadChildren: () => import('./slide-toggle/routes').then(m => m.routes),
    title: 'Slide Toggle'
  },
  {
    path: 'checkbox',
    loadChildren: () => import('./checkbox/routes').then(m => m.routes),
    title: 'Checkbox'
  },
  {
    path: 'radio',
    loadChildren: () => import('./radio/routes').then(m => m.routes),
    title: 'Radio'
  },
  {
    path: 'select',
    loadChildren: () => import('./select/routes').then(m => m.routes),
    title: 'Select'
  },
  {
    path: 'segmented',
    loadChildren: () => import('./segmented/routes').then(m => m.routes),
    title: 'Segmented'
  },
  {
    path: 'pin-input',
    loadChildren: () => import('./pin-input/routes').then(m => m.routes),
    title: 'Pin Input'
  },
  {
    path: 'button-toggle',
    loadChildren: () => import('./button-toggle/routes').then(m => m.routes),
    title: 'Button Toggle'
  },
  {
    path: 'number-input',
    loadChildren: () => import('./number-input/routes').then(m => m.routes),
    title: 'Number Input'
  },
  {
    path: 'country',
    loadChildren: () => import('./country/routes').then(m => m.routes),
    title: 'Country'
  },
  {
    path: 'timezone',
    loadChildren: () => import('./timezone/routes').then(m => m.routes),
    title: 'Timezone'
  },
  {
    path: 'form-renderer',
    loadChildren: () => import('./form-renderer/routes').then(m => m.routes),
    title: 'Form Renderer'
  },
  {
    path: 'inline-text-edit',
    loadChildren: () => import('./inline-text-edit/routes').then(m => m.routes),
    title: 'Inline Text Edit'
  },
  {
    path: 'currency-select',
    loadChildren: () => import('./currency-select/routes').then(m => m.routes),
    title: 'Currency Select'
  },
  {
    path: 'date-format-select',
    loadChildren: () => import('./date-format-select/routes').then(m => m.routes),
    title: 'Date Format Select'
  },
  {
    path: 'input-mask',
    loadChildren: () => import('./input-mask/routes').then(m => m.routes),
    title: 'Input Mask'
  },
  {
    path: 'input-validator',
    loadChildren: () => import('./input-validator/routes').then(m => m.routes),
    title: 'Input Validator'
  },
];
