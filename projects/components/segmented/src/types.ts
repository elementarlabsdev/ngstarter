import { InjectionToken } from '@angular/core';

export const SEGMENTED = new InjectionToken('SEGMENTED');
export type SegmentedTriggerSize = 'sm' | 'default' | string;
