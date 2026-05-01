import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal, inject, computed
} from '@angular/core';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { TourService } from '../tour.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { TourStepConfig, TOUR_CONFIG } from '../tour.types';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'ngs-tour-step',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass,
    CommonModule,
    Button
  ],
  templateUrl: './tour-step.html',
  styleUrl: './tour-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-tour-step not-prose',
    '[class.animate-enter]': 'animateEnterClass()',
    '[class.animate-leave]': 'animateLeaveClass()',
  }
})
export class TourStep {
  readonly tourService = inject(TourService);
  private _sanitizer = inject(DomSanitizer);

  step = input.required<TourStepConfig>();
  isFirst = input(false);
  isLast = input(false);
  position = input<ConnectedPosition | null>(null);

  animateEnterClass = input(true);
  animateLeaveClass = input(false);

  readonly config = inject(TOUR_CONFIG, { optional: true });

  protected readonly htmlContent = computed(() => {
    const html = this.step().htmlContent;
    return html ? this._sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  getArrowClasses(pos: ConnectedPosition | null): string {
    if (!pos) {
      return 'hidden';
    }

    const classes = [];

    // Vertical position of the arrow on the step
    if (pos.overlayY === 'top' && pos.originY === 'bottom') {
      classes.push('pos-top'); // Arrow on the top edge of the step
    } else if (pos.overlayY === 'bottom' && pos.originY === 'top') {
      classes.push('pos-bottom'); // Arrow on the bottom edge of the step
    } else if (pos.overlayX === 'start' && pos.originX === 'end') {
      // Step is to the right of the element (AFTER)
      classes.push('pos-left');
    } else if (pos.overlayX === 'end' && pos.originX === 'start') {
      // Step is to the left of the element (BEFORE)
      classes.push('pos-right');
    }

    // Alignment of the arrow on the chosen edge
    if (classes.includes('pos-top') || classes.includes('pos-bottom')) {
      if (pos.overlayX === 'center') {
        classes.push('align-center');
      } else if (pos.overlayX === 'start') {
        classes.push('align-start');
      } else if (pos.overlayX === 'end') {
        classes.push('align-end');
      }
    } else if (classes.includes('pos-left') || classes.includes('pos-right')) {
      if (pos.overlayY === 'center') {
        classes.push('align-center');
      } else if (pos.overlayY === 'top') {
        classes.push('align-start');
      } else if (pos.overlayY === 'bottom') {
        classes.push('align-end');
      }
    }

    return classes.join(' ');
  }
}
