import { InjectionToken, ViewContainerRef, Injectable } from '@angular/core';
import { AriaLivePoliteness } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';

/** Injection token that can be used to access the data that was passed in to a snack bar. */
export const SNACK_BAR_DATA = new InjectionToken<any>('SnackBarData');

/** Injection token that can be used to specify default snack bar. */
export const SNACK_BAR_CONFIG = new InjectionToken<SnackBarConfig>('SnackBarConfig');

/** Function to provide the snack bar configuration. */
export function provideSnackBarConfig(config: SnackBarConfig) {
  return {
    provide: SNACK_BAR_CONFIG,
    useValue: config,
  };
}

export type SnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
export type SnackBarVerticalPosition = 'top' | 'bottom';

export class SnackBarConfig<D = any> {
  /** The politeness level for the MatAriaLiveAnnouncer announcement. */
  politeness?: AriaLivePoliteness = 'assertive';

  /** Message to be announced by the LiveAnnouncer. */
  announcementMessage?: string = '';

  /** The view container that should be used for the snack bar's origin. */
  viewContainerRef?: ViewContainerRef;

  /** The duration in milliseconds to wait before automatically closing the snack bar. */
  duration?: number = 0;

  /** Extra CSS classes to be added to the snack bar container. */
  panelClass?: string | string[];

  /** Text layout direction for the snack bar. */
  direction?: Direction;

  /** The horizontal position to place the snack bar. */
  horizontalPosition?: SnackBarHorizontalPosition = 'center';

  /** The vertical position to place the snack bar. */
  verticalPosition?: SnackBarVerticalPosition = 'bottom';

  /** Data being injected into the child component. */
  data?: D | null = null;
}
