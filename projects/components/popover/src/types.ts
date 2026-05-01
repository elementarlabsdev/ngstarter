import { OverlayPosition } from '@ngstarter-ui/components/overlay';
import { InjectionToken } from '@angular/core';

export type PopoverTrigger = 'click' | 'hover';
export type PopoverPosition = OverlayPosition;

export interface PopoverTriggerFor {
  isOpen(): boolean;
  open(): void;
  close(): void;
}

export const POPOVER_TRIGGER = new InjectionToken<PopoverTriggerFor>('POPOVER_TRIGGER');
