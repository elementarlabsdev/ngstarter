import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { AvatarAppearance } from './types';

export interface AvatarConfig {
  appearance?: AvatarAppearance;
}

export const AVATAR_CONFIG = new InjectionToken<AvatarConfig>('AVATAR_CONFIG');

export function provideAvatar(config: AvatarConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AVATAR_CONFIG, useValue: config }
  ]);
}
