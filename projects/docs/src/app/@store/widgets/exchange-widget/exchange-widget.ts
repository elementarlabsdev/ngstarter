import { Component,  inject, input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { FormField as SignalFormField, form, min } from '@angular/forms/signals';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Divider } from '@ngstarter-ui/components/divider';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-exchange-content',
  imports: [
    Icon,
    Button,
    SignalFormField,
    Divider,
    Ripple
  ],
  templateUrl: './exchange-widget.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './exchange-widget.scss'
})
export class ExchangeWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input();

  conversionFromRate: number = 1.3275;
  conversionToRate: number = 0.7532;
  currentConversionRate = 1.3275;
  currencyFrom = 'GPB';
  currencyTo = 'USD';

  readonly form = form(signal<{ from: number | null; to: number | null }>({ from: null, to: null }), path => {
    min(path.from, 0);
    min(path.to, 0);
  });

  ngOnInit(): void {
    if (this._grid && this.widget()) this._grid.markItemAsLoaded(this.id());
  }

  protected convert(source: 'from' | 'to'): void {
    const value = this.form[source]().controlValue();
    if (value === null) return;
    const converted = source === 'from' ? value * this.currentConversionRate : value / this.currentConversionRate;
    this.form[source === 'from' ? 'to' : 'from']().value.set(Number(converted.toFixed(4)));
  }

  toggleCurrencies() {
    const prevCurrencyFrom = this.currencyFrom;
    this.currencyFrom = this.currencyTo;
    this.currencyTo = prevCurrencyFrom;

    const prevConversionToRate = this.conversionToRate;
    this.conversionToRate = this.conversionFromRate;
    this.conversionFromRate = prevConversionToRate;
    this.currentConversionRate = this.conversionFromRate;

    this.convert('from');
  }
}
