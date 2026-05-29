import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { DigitRoller, DigitRollerGroupDirective } from '@ngstarter-ui/components/digit-roller';

interface SizeExample {
  label: string;
  description: string;
  className: string;
  value: () => number;
  format: Intl.NumberFormatOptions;
  prefix?: string;
  unit?: string;
  continuous?: boolean;
  duration?: number;
  stagger?: number;
}

@Component({
  selector: 'app-digit-roller-dashboard-example',
  imports: [
    DigitRoller,
    DigitRollerGroupDirective,
  ],
  templateUrl: './digit-roller-dashboard-example.html',
  styleUrl: './digit-roller-dashboard-example.scss',
})
export class DigitRollerDashboardExample implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private tick = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  readonly integerFormat: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
  };
  readonly compactFormat: Intl.NumberFormatOptions = {
    notation: 'compact',
    maximumFractionDigits: 1,
  };
  readonly moneyFormat: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  readonly percentFormat: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  };
  readonly decimalFormat: Intl.NumberFormatOptions = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  };

  tinyValue = computed(() => 0.128 + (this.tick() % 6) * 0.004);
  smallValue = computed(() => 42 + (this.tick() % 8));
  mediumValue = computed(() => 1280 + this.tick() * 17);
  largeValue = computed(() => 24999.99 + (this.tick() % 7) * 125.5);
  displayValue = computed(() => 128400 + this.tick() * 1840);
  heroValue = computed(() => 1236511.34 + this.tick() * 9825.75);

  readonly examples: SizeExample[] = [
    {
      label: 'Tiny',
      description: 'Inline badges, deltas, and compact helper text.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--tiny',
      value: () => this.tinyValue(),
      format: this.percentFormat,
      continuous: true,
      duration: 520,
    },
    {
      label: 'Small',
      description: 'Short counters inside dense product UI.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--small',
      value: () => this.smallValue(),
      format: this.integerFormat,
      unit: 'tasks',
      duration: 640,
    },
    {
      label: 'Medium',
      description: 'Default metric size for cards, lists, and summaries.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--medium',
      value: () => this.mediumValue(),
      format: this.integerFormat,
      continuous: true,
      stagger: 12,
    },
    {
      label: 'Large',
      description: 'Primary totals and pricing surfaces.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--large',
      value: () => this.largeValue(),
      format: this.moneyFormat,
      continuous: true,
      stagger: 16,
    },
    {
      label: 'Display',
      description: 'Big dashboard values with compact notation.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--display',
      value: () => this.displayValue(),
      format: this.compactFormat,
      unit: 'views',
      continuous: true,
      stagger: 18,
    },
    {
      label: 'Hero',
      description: 'Headline financial or operational numbers.',
      className: 'digit-roller-size-example__value digit-roller-size-example__value--hero',
      value: () => this.heroValue(),
      format: this.moneyFormat,
      continuous: true,
      duration: 1100,
      stagger: 22,
    },
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.tick.update(value => value + 1), 1800);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
