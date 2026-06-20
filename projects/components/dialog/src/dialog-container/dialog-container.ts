import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit } from '@angular/core';
import { CdkDialogContainer, DialogModule } from '@angular/cdk/dialog';
import { Button } from "@ngstarter-ui/components/button";
import { Icon } from "@ngstarter-ui/components/icon";
import type { DialogConfig } from "../dialog-config";

@Component({
  selector: 'ngs-dialog-container',
  exportAs: 'ngsDialogContainer',
  imports: [
    DialogModule,
    Button,
    Icon,
  ],
  templateUrl: './dialog-container.html',
  styleUrl: './dialog-container.scss',
  host: {
    'class': 'ngs-dialog-container',
    '[class.ngs-dialog-container-enter]': '_animationState === "enter"',
    '[class.ngs-dialog-container-exit]': '_animationState === "exit"',
    '(transitionend)': '_onTransitionEnd($event)',
  },
})
export class DialogContainer extends CdkDialogContainer implements OnInit {
  private readonly _cdr = inject(ChangeDetectorRef);
  private _closeHandler?: () => void;

  get showCloseButton(): boolean {
    return Boolean((this._config as DialogConfig).showCloseButton);
  }

  /** State of the dialog animation. */
  _animationState: 'void' | 'enter' | 'exit' = 'void';

  /** Emits when an animation state changes. */
  _animationStateChanged = new EventEmitter<any>();

  ngOnInit() {
    const config = this._config;
    if (config) {
      const element = (this as any)._elementRef.nativeElement;

      if (config.maxWidth) {
        element.style.setProperty('--ngs-dialog-container-max-width', this._formatValue(config.maxWidth));
      }

      if (config.minWidth) {
        element.style.setProperty('--ngs-dialog-container-min-width', this._formatValue(config.minWidth));
      }

      if (config.width) {
        element.style.setProperty('--ngs-dialog-container-max-width', 'none');
      }
    }
  }

  private _formatValue(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }

  _onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === 'opacity' && event.target === event.currentTarget) {
      this._animationStateChanged.emit({
        fromState: this._animationState === 'enter' ? 'void' : 'enter',
        toState: this._animationState,
        totalTime: 150,
        phaseName: 'done',
      } as any);
    }
  }

  /** Starts the dialog enter animation. */
  _startEnterAnimation(): void {
    this._animationState = 'enter';
    this._cdr.markForCheck();
  }

  /** Starts the dialog exit animation. */
  _startExitAnimation(): void {
    this._animationState = 'exit';
    this._cdr.markForCheck();
  }

  _setCloseHandler(handler: () => void): void {
    this._closeHandler = handler;
  }

  protected close(): void {
    this._closeHandler?.();
  }
}
