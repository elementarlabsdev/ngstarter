import { contentChildren, Directive, forwardRef } from '@angular/core';
import { DigitRoller } from './digit-roller/digit-roller';
import {
  DIGIT_ROLLER_GROUP,
  DigitRollerGroupCoordinator,
  DigitRollerGroupMember,
} from './digit-roller-group.token';

@Directive({
  selector: '[ngsDigitRollerGroup]',
  providers: [
    {
      provide: DIGIT_ROLLER_GROUP,
      useExisting: forwardRef(() => DigitRollerGroupDirective),
    },
  ],
})
export class DigitRollerGroupDirective implements DigitRollerGroupCoordinator {
  private children = contentChildren(DigitRoller, { descendants: true });
  private pendingUpdates = new Map<DigitRollerGroupMember, () => void>();
  private flushQueued = false;

  requestGroupedUpdate(member: DigitRollerGroupMember, applyUpdate: () => void): boolean {
    if (!member.canGroupAnimateNow()) {
      return false;
    }

    this.pendingUpdates.set(member, applyUpdate);

    if (!this.flushQueued) {
      this.flushQueued = true;
      queueMicrotask(() => this.flushGroupedUpdates());
    }

    return true;
  }

  private flushGroupedUpdates(): void {
    this.flushQueued = false;

    if (this.pendingUpdates.size === 0) {
      return;
    }

    const members = this.children().filter((child) => child.canGroupAnimateNow());

    for (const member of members) {
      member.prepareGroupedUpdate();
    }

    for (const applyUpdate of this.pendingUpdates.values()) {
      applyUpdate();
    }

    this.pendingUpdates.clear();

    for (const member of members) {
      member.queueGroupedAnimation();
    }
  }
}
