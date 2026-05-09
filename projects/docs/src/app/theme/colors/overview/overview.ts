import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { PrimaryColorsExample } from '../_examples/primary-colors-example/primary-colors-example';
import {
  SecondaryColorsExample
} from '../_examples/secondary-colors-example/secondary-colors-example';
import { TertiaryColorsExample } from '../_examples/tertiary-colors-example/tertiary-colors-example';
import { ErrorColorsExample } from '../_examples/error-colors-example/error-colors-example';
import { SurfaceColorsExample } from '../_examples/surface-colors-example/surface-colors-example';
import { OutlineColorsExample } from '../_examples/outline-colors-example/outline-colors-example';
import { InverseColorsExample } from '../_examples/inverse-colors-example/inverse-colors-example';
import { NeutralColorsExample } from '../_examples/neutral-colors-example/neutral-colors-example';
import { OtherColorsExample } from '../_examples/other-colors-example/other-colors-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { GreenColorsExample } from '../_examples/green-colors-example/green-colors-example';
import { BlueColorsExample } from '../_examples/blue-colors-example/blue-colors-example';
import { OrangeColorsExample } from '../_examples/orange-colors-example/orange-colors-example';
import { RedColorsExample } from '../_examples/red-colors-example/red-colors-example';

interface ThemeColorToken {
  css: string;
  aliases?: string[];
}

interface ThemeColorGroup {
  name: string;
  tokens: ThemeColorToken[];
}

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    PrimaryColorsExample,
    SecondaryColorsExample,
    TertiaryColorsExample,
    ErrorColorsExample,
    SurfaceColorsExample,
    OutlineColorsExample,
    InverseColorsExample,
    NeutralColorsExample,
    OtherColorsExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    GreenColorsExample,
    BlueColorsExample,
    OrangeColorsExample,
    RedColorsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
  readonly colorGroups: ThemeColorGroup[] = [
    {
      name: 'Primary',
      tokens: [
        { css: '--ngs-color-primary', aliases: ['primary'] },
        { css: '--ngs-color-on-primary', aliases: ['on-primary'] },
        { css: '--ngs-color-primary-container', aliases: ['primary-container'] },
        { css: '--ngs-color-on-primary-container', aliases: ['on-primary-container'] },
        { css: '--ngs-color-primary-100' },
        { css: '--ngs-color-primary-200' },
        { css: '--ngs-color-primary-300' },
        { css: '--ngs-color-primary-400' },
        { css: '--ngs-color-primary-500' },
        { css: '--ngs-color-primary-600' },
      ]
    },
    {
      name: 'Secondary',
      tokens: [
        { css: '--ngs-color-secondary', aliases: ['secondary'] },
        { css: '--ngs-color-on-secondary', aliases: ['on-secondary'] },
        { css: '--ngs-color-secondary-container', aliases: ['secondary-container'] },
        { css: '--ngs-color-on-secondary-container', aliases: ['on-secondary-container'] },
        { css: '--ngs-color-secondary-100' },
        { css: '--ngs-color-secondary-200' },
        { css: '--ngs-color-secondary-300' },
        { css: '--ngs-color-secondary-400' },
        { css: '--ngs-color-secondary-fixed' },
        { css: '--ngs-color-on-secondary-fixed' },
      ]
    },
    {
      name: 'Tertiary',
      tokens: [
        { css: '--ngs-color-tertiary', aliases: ['tertiary'] },
        { css: '--ngs-color-on-tertiary', aliases: ['on-tertiary'] },
        { css: '--ngs-color-tertiary-container', aliases: ['tertiary-container'] },
        { css: '--ngs-color-on-tertiary-container', aliases: ['on-tertiary-container'] },
        { css: '--ngs-color-tertiary-100' },
        { css: '--ngs-color-tertiary-200' },
        { css: '--ngs-color-tertiary-300' },
        { css: '--ngs-color-tertiary-700' },
        { css: '--ngs-color-tertiary-800' },
      ]
    },
    {
      name: 'Status',
      tokens: [
        { css: '--ngs-color-danger', aliases: ['error', 'negative'] },
        { css: '--ngs-color-on-danger', aliases: ['on-error', 'on-negative'] },
        { css: '--ngs-color-danger-container', aliases: ['error-container', 'negative-container'] },
        { css: '--ngs-color-on-danger-container', aliases: ['on-error-container', 'on-negative-container'] },
        { css: '--ngs-color-info', aliases: ['informative'] },
        { css: '--ngs-color-on-info', aliases: ['on-informative'] },
        { css: '--ngs-color-info-container', aliases: ['informative-container'] },
        { css: '--ngs-color-on-info-container', aliases: ['on-informative-container'] },
        { css: '--ngs-color-success', aliases: ['positive'] },
        { css: '--ngs-color-on-success', aliases: ['on-positive'] },
        { css: '--ngs-color-success-container', aliases: ['positive-container'] },
        { css: '--ngs-color-on-success-container', aliases: ['on-positive-container'] },
        { css: '--ngs-color-warning', aliases: ['notice'] },
        { css: '--ngs-color-on-warning', aliases: ['on-notice'] },
        { css: '--ngs-color-warning-container', aliases: ['notice-container'] },
        { css: '--ngs-color-on-warning-container', aliases: ['on-notice-container'] },
        { css: '--ngs-color-danger-container-lowest', aliases: ['error-container-lowest'] },
        { css: '--ngs-color-danger-container-low', aliases: ['error-container-low'] },
        { css: '--ngs-color-danger-container-high', aliases: ['error-container-high'] },
        { css: '--ngs-color-danger-container-highest', aliases: ['error-container-highest'] },
        { css: '--ngs-color-orange-container' },
        { css: '--ngs-color-on-orange-container' },
        { css: '--ngs-color-green-500' },
      ]
    },
    {
      name: 'Surface',
      tokens: [
        { css: '--ngs-color-background', aliases: ['background'] },
        { css: '--ngs-color-on-background', aliases: ['on-background'] },
        { css: '--ngs-color-surface', aliases: ['surface'] },
        { css: '--ngs-color-surface-bright' },
        { css: '--ngs-color-on-surface', aliases: ['on-surface'] },
        { css: '--ngs-color-on-surface-variant', aliases: ['on-surface-variant'] },
        { css: '--ngs-color-surface-container-lowest', aliases: ['surface-container-lowest'] },
        { css: '--ngs-color-surface-container-low', aliases: ['surface-container-low'] },
        { css: '--ngs-color-surface-container', aliases: ['surface-container'] },
        { css: '--ngs-color-surface-container-high', aliases: ['surface-container-high'] },
        { css: '--ngs-color-surface-container-highest', aliases: ['surface-container-highest'] },
        { css: '--ngs-color-outline', aliases: ['outline'] },
        { css: '--ngs-color-outline-variant', aliases: ['outline-variant'] },
        { css: '--ngs-color-border', aliases: ['border'] },
        { css: '--ngs-color-faint', aliases: ['faint'] },
        { css: '--ngs-color-subtle', aliases: ['subtle'] },
        { css: '--ngs-color-muted', aliases: ['muted'] },
        { css: '--ngs-color-emphasis', aliases: ['emphasis'] },
        { css: '--ngs-color-strong', aliases: ['strong'] },
      ]
    },
    {
      name: 'Neutral',
      tokens: [
        { css: '--ngs-color-neutral-50', aliases: ['neutral-50'] },
        { css: '--ngs-color-neutral-100', aliases: ['neutral-100'] },
        { css: '--ngs-color-neutral-200', aliases: ['neutral-200'] },
        { css: '--ngs-color-neutral-300', aliases: ['neutral-300'] },
        { css: '--ngs-color-neutral-400', aliases: ['neutral-400'] },
        { css: '--ngs-color-neutral-500', aliases: ['neutral-500'] },
        { css: '--ngs-color-neutral-600', aliases: ['neutral-600'] },
        { css: '--ngs-color-neutral-650' },
        { css: '--ngs-color-neutral-700', aliases: ['neutral-700'] },
        { css: '--ngs-color-neutral-800', aliases: ['neutral-800'] },
        { css: '--ngs-color-neutral-900', aliases: ['neutral-900'] },
        { css: '--ngs-color-neutral-950', aliases: ['neutral-950'] },
        { css: '--ngs-color-neutral' },
        { css: '--ngs-color-black' },
        { css: '--ngs-color-white' },
      ]
    },
    {
      name: 'State',
      tokens: [
        { css: '--ngs-state-hover-bg', aliases: ['state-hover'] },
        { css: '--ngs-state-active-bg', aliases: ['state-active'] },
        { css: '--ngs-state-selected-bg', aliases: ['state-selected'] },
        { css: '--ngs-state-selected-color' },
        { css: '--ngs-state-focus-ring' },
        { css: '--ngs-state-disabled-bg', aliases: ['state-disabled'] },
        { css: '--ngs-state-disabled-color' },
        { css: '--ngs-state-disabled-border' },
      ]
    },
  ];

  colorValue(token: ThemeColorToken): string {
    return `var(${token.css})`;
  }

  tokenAliases(token: ThemeColorToken): string {
    return token.aliases?.map(alias => `--color-${alias}`).join(', ') || 'Component token only';
  }
}
