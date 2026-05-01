import { InjectionToken } from '@angular/core';

export interface TimepickerConfig {
  interval?: number | string;
}

export const TIMEPICKER_CONFIG = new InjectionToken<TimepickerConfig>('TIMEPICKER_CONFIG');
