import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Divider } from '@ngstarter-ui/components/divider';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-exchange-content',
  imports: [
    Icon,
    Button,
    ReactiveFormsModule,
    Divider,
    Ripple
  ],
  templateUrl: './exchange-widget.html',
  styleUrl: './exchange-widget.scss'
})
export class ExchangeWidget implements OnInit {
  private _fb = inject(FormBuilder);
  private _destroyRef = inject(DestroyRef);
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  widget = input();

  conversionFromRate: number = 1.3275;
  conversionToRate: number = 0.7532;
  currentConversionRate = 1.3275;
  currencyFrom = 'GPB';
  currencyTo = 'USD';

  form: FormGroup = this._fb.group({
    from: [],
    to: []
  });

  ngOnInit() {
    if (this._grid && this.widget()) {
      this._grid.markItemAsLoaded(this.id());
    }

    this.form.get('from')
      ?.valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value: number) => {
        if (value !== null) {
          const result = (value * this.currentConversionRate).toFixed(4);
          this.form.get('to')?.setValue(result, {
            emitEvent: false
          });
        }
      })
    ;
    this.form.get('to')
      ?.valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value: number) => {
        if (value !== null) {
          const result = (value / this.currentConversionRate).toFixed(4);
          this.form.get('from')?.setValue(result, {
            emitEvent: false
          });
        }
      })
    ;
  }

  toggleCurrencies() {
    const prevCurrencyFrom = this.currencyFrom;
    this.currencyFrom = this.currencyTo;
    this.currencyTo = prevCurrencyFrom;

    const prevConversionToRate = this.conversionToRate;
    this.conversionToRate = this.conversionFromRate;
    this.conversionFromRate = prevConversionToRate;
    this.currentConversionRate = this.conversionFromRate;

    this.form.get('from')?.setValue(this.form.value['from']);
  }
}
