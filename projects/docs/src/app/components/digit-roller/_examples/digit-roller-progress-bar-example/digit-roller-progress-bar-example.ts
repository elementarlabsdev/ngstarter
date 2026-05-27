import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { DigitRoller, DigitRollerGroupDirective } from '@ngstarter-ui/components/digit-roller';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'app-digit-roller-progress-bar-example',
  imports: [
    DigitRoller,
    DigitRollerGroupDirective,
    ProgressBar,
  ],
  templateUrl: './digit-roller-progress-bar-example.html',
})
export class DigitRollerProgressBarExample implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private tick = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  readonly percentFormat: Intl.NumberFormatOptions = {
    style: 'percent',
    maximumFractionDigits: 0,
  };
  readonly integerFormat: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
  };

  progress = computed(() => 36 + (this.tick() % 13) * 5);
  remaining = computed(() => Math.max(0, 100 - this.progress()));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.tick.update(value => value + 1), 1600);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
