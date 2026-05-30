import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { StepTrackerDescription } from '../step-tracker-description/step-tracker-description';
import { StepTrackerLabel } from '../step-tracker-label/step-tracker-label';

export type StepTrackerResolvedItemState =
  | 'completed'
  | 'current'
  | 'pending'
  | 'error'
  | 'disabled';

export type StepTrackerItemState = StepTrackerResolvedItemState | 'auto';

@Component({
  selector: 'ngs-step-tracker-item',
  exportAs: 'ngsStepTrackerItem',
  imports: [StepTrackerDescription, StepTrackerLabel],
  templateUrl: './step-tracker-item.html',
  styleUrl: './step-tracker-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-step-tracker-item',
    'role': 'listitem',
    '[class.ngs-step-tracker-item-completed]': 'resolvedState() === "completed"',
    '[class.ngs-step-tracker-item-current]': 'resolvedState() === "current"',
    '[class.ngs-step-tracker-item-pending]': 'resolvedState() === "pending"',
    '[class.ngs-step-tracker-item-error]': 'resolvedState() === "error"',
    '[class.ngs-step-tracker-item-disabled]': 'resolvedState() === "disabled"',
    '[attr.aria-current]': 'resolvedState() === "current" ? "step" : null',
    '[attr.aria-disabled]': 'resolvedState() === "disabled" ? "true" : null',
  },
})
export class StepTrackerItem {
  readonly state = input<StepTrackerItemState>('auto');
  readonly label = input<string>('');
  readonly description = input<string>('');

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _trackerState = signal<StepTrackerResolvedItemState>('pending');

  readonly resolvedState = computed<StepTrackerResolvedItemState>(() => {
    const state = this.state();
    return state === 'auto' ? this._trackerState() : state;
  });

  setTrackerState(state: StepTrackerResolvedItemState): void {
    this._trackerState.set(state);
  }

  getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  getIndicatorRect(): DOMRect | null {
    return this._elementRef.nativeElement.querySelector('.indicator')?.getBoundingClientRect() ?? null;
  }

  setHorizontalConnector(left: number, width: number, top: number): void {
    const element = this._elementRef.nativeElement;

    element.style.setProperty('--ngs-step-tracker-connector-left', `${Math.round(left)}px`);
    element.style.setProperty('--ngs-step-tracker-connector-length', `${Math.max(0, Math.round(width))}px`);
    element.style.setProperty('--ngs-step-tracker-connector-right', 'auto');
    element.style.setProperty('--ngs-step-tracker-connector-top', `${Math.round(top)}px`);
  }

  resetHorizontalConnector(): void {
    const element = this._elementRef.nativeElement;

    element.style.removeProperty('--ngs-step-tracker-connector-left');
    element.style.removeProperty('--ngs-step-tracker-connector-length');
    element.style.removeProperty('--ngs-step-tracker-connector-right');
    element.style.removeProperty('--ngs-step-tracker-connector-top');
  }
}
