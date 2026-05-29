import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { DigitRoller, DigitRollerGroupDirective } from '@ngstarter-ui/components/digit-roller';
import { Gauge, GaugeValue } from '@ngstarter-ui/components/gauge';

@Component({
  selector: 'app-digit-roller-gauge-example',
  imports: [
    DigitRoller,
    DigitRollerGroupDirective,
    Gauge,
    GaugeValue,
  ],
  templateUrl: './digit-roller-gauge-example.html',
})
export class DigitRollerGaugeExample implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private tick = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  readonly integerFormat: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
  };

  score = computed(() => 64 + (this.tick() % 9) * 4);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.tick.update(value => value + 1), 1700);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
