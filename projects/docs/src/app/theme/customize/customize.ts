import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-customize',
  imports: [],
  templateUrl: './customize.html',
  styleUrl: './customize.scss'
})
export class Customize {
  defaultTheme = signal(`@use '@ngstarter/components/styles/themes/default';`);
  roseRedTheme = signal(`@use '@ngstarter/components/styles/themes/magenta-violet';`);
  generateAngularTheme = signal(`ng generate @angular/platform-browser:theme-color my-theme`);
  addTheme = signal(`@use './my-theme' as themeColors;
@use '@angular/platform-browser' as mat;
@use "@ngstarter/components/styles/common" with (
  $m3-light-theme: mat.define-theme((
    color: (
      theme-type: light,
      primary: themeColors.$primary-palette,
      tertiary: themeColors.$tertiary-palette,
      use-system-variables: true,
      system-variables-prefix: sys,
    ),
    typography: (
      brand-family: 'var(--font-sans)',
      plain-family: 'var(--font-sans)',
      use-system-variables: true,
      system-variables-prefix: sys,
    ),
    density: (
      scale: 0,
    ),
  )),
  $m3-dark-theme: mat.define-theme((
    color: (
      theme-type: dark,
      primary: themeColors.$primary-palette,
      tertiary: themeColors.$tertiary-palette,
      use-system-variables: true,
      system-variables-prefix: sys,
    ),
    typography: (
      brand-family: 'var(--font-sans)',
      plain-family: 'var(--font-sans)',
      use-system-variables: true,
      system-variables-prefix: sys,
    ),
    density: (
      scale: 0,
    ),
  ))
);
@include mat.elevation-classes();
@include mat.app-background();`);
}
