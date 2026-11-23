import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  effect,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ReadonlyFieldTree } from '@angular/forms/signals';

@Component({
  selector: 'ngs-headless-step',
  exportAs: 'ngsHeadlessStep',
  template: `<ng-content/>`,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-headless-step',
    '[style.display]': 'isActive() ? "block" : "none"',
  }
})
export class HeadlessStep {
  /** Form control associated with this step */
  stepControl = input<ReadonlyFieldTree<unknown> | AbstractControl | undefined>(undefined);
  /** Whether the step is optional */
  optional = input(false, {
    transform: coerceBooleanProperty
  });

  /** Whether the user has interacted with this step (writable signal) */
  readonly interacted = signal(false);
  /** Whether this step is currently active (writable signal, controlled by Stepper) */
  readonly isActive = signal(false);
  /** Internal writable signal tracking the validity of the stepControl */
  private readonly _isValid = signal(true); // Default to true if no control

  constructor() {
    effect(onCleanup => {
      const control = this.stepControl();
      if (typeof control === 'function') {
        this._isValid.set(control().valid());
      } else {
        this._isValid.set(control?.valid ?? true);
        const subscription = control?.statusChanges.subscribe(() => this._isValid.set(control.valid));
        if (subscription) onCleanup(() => subscription.unsubscribe());
      }
    });
  }

  /** Computed signal indicating if the step is completed */
  readonly completed = computed(() => {
    // A step is completed if it doesn't have a stepControl or
    // if the internal _isValid signal (reflecting the control's validity) is true.
    return !this.stepControl() || this._isValid();
  });

  /**
   * Checks if the step is currently valid.
   * Considers the validity of the associated stepControl if provided.
   * @returns boolean True if the step is valid, false otherwise.
   */
  public isValid(): boolean {
    return this._isValid(); // Directly return the tracked validity state
  }

  /** Resets the step's interacted state */
  reset(): void {
    this.interacted.set(false);
  }

  /** Sets the active state of the step */
  setActive(active: boolean): void {
    this.isActive.set(active);
  }

  /** Sets the interacted state of the step */
  setInteracted(interacted: boolean): void {
    this.interacted.set(interacted);
  }
}
