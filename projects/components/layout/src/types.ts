import { InjectionToken } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';

export const LAYOUT = new InjectionToken('LAYOUT');

export interface LayoutSidebarVisibilityChange {
  layoutId: string;
  shown: boolean;
}

export interface LayoutContentInterface {
  scrollContainer(): HTMLElement;
  scrollable?: CdkScrollable;
}

export const LAYOUT_CONTENT = new InjectionToken<LayoutContentInterface>('LAYOUT_CONTENT');

