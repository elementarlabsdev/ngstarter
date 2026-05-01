import { InjectionToken } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';

export interface PanelContentInterface {
  scrollContainer(): HTMLElement;
  scrollable?: CdkScrollable;
}

export const PANEL_CONTENT = new InjectionToken<PanelContentInterface>('PANEL_CONTENT');

