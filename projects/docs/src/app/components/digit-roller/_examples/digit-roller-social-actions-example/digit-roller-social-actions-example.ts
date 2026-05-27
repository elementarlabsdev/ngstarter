import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { DigitRoller, DigitRollerGroupDirective } from '@ngstarter-ui/components/digit-roller';
import { Icon } from '@ngstarter-ui/components/icon';

interface SocialAction {
  label: string;
  icon: string;
  value: () => number;
  format: Intl.NumberFormatOptions;
}

@Component({
  selector: 'app-digit-roller-social-actions-example',
  imports: [
    Button,
    DigitRoller,
    DigitRollerGroupDirective,
    Icon,
  ],
  templateUrl: './digit-roller-social-actions-example.html',
})
export class DigitRollerSocialActionsExample implements OnDestroy {
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

  comments = computed(() => 42 + (this.tick() % 7));
  reposts = computed(() => 2100 + this.tick() * 18);
  likes = computed(() => 21100 + this.tick() * 96);
  views = computed(() => 431700 + this.tick() * 1480);

  readonly actions: SocialAction[] = [
    {
      label: 'Comments',
      icon: 'fluent:comment-24-regular',
      value: () => this.comments(),
      format: this.integerFormat,
    },
    {
      label: 'Reposts',
      icon: 'fluent:arrow-repeat-all-24-regular',
      value: () => this.reposts(),
      format: this.compactFormat,
    },
    {
      label: 'Likes',
      icon: 'fluent:heart-24-regular',
      value: () => this.likes(),
      format: this.compactFormat,
    },
    {
      label: 'Views',
      icon: 'fluent:data-bar-vertical-24-regular',
      value: () => this.views(),
      format: this.compactFormat,
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
