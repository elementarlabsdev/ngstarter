import { InjectionToken } from '@angular/core';

export interface DigitRollerGroupMember {
  canGroupAnimateNow(): boolean;
  prepareGroupedUpdate(): void;
  queueGroupedAnimation(): void;
}

export interface DigitRollerGroupCoordinator {
  requestGroupedUpdate(member: DigitRollerGroupMember, applyUpdate: () => void): boolean;
}

export const DIGIT_ROLLER_GROUP = new InjectionToken<DigitRollerGroupCoordinator>('DIGIT_ROLLER_GROUP');
