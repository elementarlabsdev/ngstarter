import { InjectionToken, makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';

export type CardAppearance = 'raised' | 'outlined' | 'filled';

export interface CardConfig {
  appearance?: CardAppearance;
}

export const CARD_CONFIG = new InjectionToken<CardConfig>('CARD_CONFIG');

export function provideCard(config: CardConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CARD_CONFIG, useValue: config }
  ]);
}
