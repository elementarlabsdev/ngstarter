import {
  Component,
  viewChild,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  LOCALE_ID,
  input,
  output,
  booleanAttribute,
  computed
} from '@angular/core';
import { formatDate } from '@angular/common';
import { OverlayModule, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Option } from '@ngstarter-ui/components/option';
import { TIMEPICKER_CONFIG } from '../timepicker-config';

@Component({
  selector: 'ngs-timepicker',
  exportAs: 'ngsTimepicker',
  imports: [
    OverlayModule,
    Option
  ],
  templateUrl: './timepicker.html',
  styleUrl: './timepicker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-timepicker'
  }
})
export class Timepicker {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _localeId = inject(LOCALE_ID);
  private _config = inject(TIMEPICKER_CONFIG, { optional: true });

  readonly _template = viewChild.required<TemplateRef<any>>('timepickerTemplate');
  readonly _panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly opened = output<void>();
  readonly closed = output<void>();

  private _overlayRef: OverlayRef | null = null;
  private _input: any = null;

  readonly disabled = input(false, {
    transform: booleanAttribute
  });
  interval = input<number, number | string>(
    typeof this._config?.interval === 'string' ? parseInt(this._config.interval, 10) : (this._config?.interval ?? 30),
    {
      transform: (value: number | string) => typeof value === 'string' ? parseInt(value, 10) : value
    }
  );

  protected _timeOptions = computed(() => {
    const input = this._input;
    const min = input?.min();
    const max = input?.max();
    const minTime = min ? this._toTimeString(min) : null;
    const maxTime = max ? this._toTimeString(max) : null;
    const options = [];
    const interval = Math.max(1, this.interval() || 1);

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += interval) {
        const value = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');

        if (minTime && value < minTime) {
          continue;
        }

        if (maxTime && value > maxTime) {
          continue;
        }

        const date = new Date();
        date.setHours(h, m, 0, 0);
        const label = formatDate(date, 'shortTime', this._localeId);
        options.push({ label, value });
      }
    }
    return options;
  });

  private _toTimeString(value: any): string {
    if (value instanceof Date) {
      return value.getHours().toString().padStart(2, '0') + ':' +
        value.getMinutes().toString().padStart(2, '0');
    }

    if (typeof value === 'string') {
      const input = this._input;

      if (input && !/^\d{2}:\d{2}$/.test(value)) {
        return input._parseValue(value);
      }
    }

    return value || '';
  }

  constructor() {}

  _registerInput(input: any) {
    this._input = input;
  }

  open() {
    const input = this._input;
    const disabled = typeof this.disabled === 'function' ? this.disabled() : this.disabled;
    const inputDisabled = typeof input?.disabled === 'function' ? input.disabled() : input?.disabled;

    if (this._overlayRef || !input || disabled || inputDisabled) {
      return;
    }

    const strategy = this._overlay.position()
      .flexibleConnectedTo(input.getConnectedOverlayOrigin())
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy: strategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      width: input.getOverlayWidth()
    });
    this._copyHostScopeToOverlay(this._overlayRef.overlayElement);

    this._overlayRef.backdropClick().subscribe(() => this.close());
    const portal = new TemplatePortal(this._template(), this._viewContainerRef);
    this._overlayRef.attach(portal);
    this.opened.emit();
    this._scrollToSelected();
  }

  close() {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this._overlayRef = null;
      this.closed.emit();
    }
  }

  _isSelected(value: string): boolean {
    return this._input?.value === value || this._input?._modelValue === value;
  }

  private _scrollToSelected() {
    setTimeout(() => {
      const panel = this._panel()?.nativeElement;

      if (!panel) {
        return;
      }

      const selectedOption = panel.querySelector('.ngs-option-selected') as HTMLElement;

      if (!selectedOption) {
        return;
      }

      const optionOffset = selectedOption.offsetTop;
      const optionHeight = selectedOption.offsetHeight;
      const panelScrollTop = panel.scrollTop;
      const panelHeight = panel.offsetHeight;

      if (optionOffset < panelScrollTop) {
        panel.scrollTop = optionOffset;
      } else if (optionOffset + optionHeight > panelScrollTop + panelHeight) {
        panel.scrollTop = optionOffset - panelHeight + optionHeight;
      }
    });
  }

  _selectValue(value: string) {
    const input = this._input;

    if (input) {
      input._setValue(value);
    }
    this.close();
  }

  isOpen() {
    return !!this._overlayRef;
  }

  private _copyHostScopeToOverlay(overlayElement: HTMLElement) {
    const hostAttributes = this._elementRef.nativeElement.attributes;

    for (let i = 0; i < hostAttributes.length; i++) {
      const attribute = hostAttributes.item(i);

      if (attribute?.name.startsWith('_nghost-')) {
        overlayElement.setAttribute(attribute.name, '');
        return;
      }
    }
  }
}
