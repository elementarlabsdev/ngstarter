import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  signal,
  inject,
  viewChild,
  TemplateRef,
  OnDestroy,
  Type,
  contentChild,
  ViewContainerRef
} from '@angular/core';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Calendar } from '../calendar/calendar/calendar';
import { DatepickerActions } from './datepicker-actions';
import { DatepickerPreset } from '../core/datetime/datepicker-preset';
import { DateRange } from '../core/datetime/date-range';

@Component({
  selector: 'ngs-datepicker',
  exportAs: 'ngsDatepicker',
  templateUrl: './datepicker.html',
  standalone: true,
  imports: [
    OverlayModule,
    Calendar
  ],
  styleUrl: './datepicker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class Datepicker<D> implements OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);

  readonly _portalTemplate = viewChild.required<TemplateRef<any>>('portal');
  readonly actions = contentChild(DatepickerActions);

  startAt = input<D | null>(null);
  calendarHeaderComponent = input<Type<any> | null>(null);
  quickPresets = input<DatepickerPreset<D>[]>([]);
  showQuickPresets = input<boolean>(false);

  _datepickerInput!: any;
  _selected = signal<D | null>(null);
  _isAbove = signal(false);

  private _overlayRef: OverlayRef | null = null;

  ngOnDestroy() {
    this.close();
  }

  _registerInput(input: any) {
    this._datepickerInput = input;
    input._valueChange.subscribe((value: any) => this._selected.set(value));
  }

  open() {
    if (this._overlayRef || !this._datepickerInput) return;

    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this._datepickerInput.getConnectedOverlayOrigin())
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      ]);

    strategy.positionChanges.subscribe(change => {
      this._isAbove.set(change.connectionPair.overlayY === 'bottom');
    });

    this._overlayRef = this._overlay.create({
      positionStrategy: strategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this._overlayRef.backdropClick().subscribe(() => this.close());

    const portal = new TemplatePortal(this._portalTemplate()!, this._viewContainerRef);
    this._overlayRef.attach(portal);
  }

  close() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  _select(date: D) {
    this._selected.set(date);

    if (!this.actions()) {
      this.apply();
    }
  }

  _selectPreset(preset: DatepickerPreset<D>) {
    const value = preset.value;
    if (value instanceof DateRange) {
      // For single datepicker we don't expect DateRange, but if it happens, we take start
      this._selected.set(value.start as D);
    } else {
      this._selected.set(value as D);
    }

    if (!this.actions()) {
      this.apply();
    }
  }

  apply() {
    const date = this._selected();

    if (this._datepickerInput && date) {
      this._datepickerInput.writeValue(date);
      this._datepickerInput._onChange(date);
    }
    this.close();
  }
}
