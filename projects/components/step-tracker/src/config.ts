import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface StepTrackerConfig {
  completedIconName?: string;
  errorIconName?: string;
}

export const STEP_TRACKER_DEFAULT_CONFIG: Required<StepTrackerConfig> = {
  completedIconName: 'fluent:checkmark-16-filled',
  errorIconName: 'fluent:error-circle-16-filled',
};

export const STEP_TRACKER_CONFIG = new InjectionToken<StepTrackerConfig>(
  'STEP_TRACKER_CONFIG',
  {
    factory: () => STEP_TRACKER_DEFAULT_CONFIG,
  },
);

export function provideStepTracker(config: StepTrackerConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: STEP_TRACKER_CONFIG,
      useValue: {
        ...STEP_TRACKER_DEFAULT_CONFIG,
        ...config,
      },
    },
  ]);
}
