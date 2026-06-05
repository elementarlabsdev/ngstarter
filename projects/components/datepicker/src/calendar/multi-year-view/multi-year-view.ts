import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
} from '@angular/core';
import { DateAdapter } from '../../core/datetime/date-adapter';

const YEARS_PER_ROW = 4;
const YEARS_PER_PAGE = 24;

@Component({
  selector: 'ngs-multi-year-view',
  exportAs: 'ngsMultiYearView',
  templateUrl: './multi-year-view.html',
  styleUrl: './multi-year-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-multi-year-view',
  },
})
export class MultiYearView<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  readonly activeDate = input.required<D>();
  readonly selected = input<D | null>(null);

  readonly yearSelected = output<D>();

  readonly years = computed(() => {
    const activeDate = this.activeDate();
    const today = this._dateAdapter.today();
    const currentYear = this._dateAdapter.getYear(activeDate);
    const selectedYear = this.selected() ? this._dateAdapter.getYear(this.selected()!) : null;
    const todayYear = this._dateAdapter.getYear(today);

    const startYear = Math.floor(currentYear / YEARS_PER_PAGE) * YEARS_PER_PAGE;

    const years: { value: number; label: string; selected: boolean; current: boolean }[][] = [];
    let currentRow: any[] = [];

    for (let i = 0; i < YEARS_PER_PAGE; i++) {
      const yearValue = startYear + i;
      const date = this._dateAdapter.createDate(yearValue, 0, 1);

      currentRow.push({
        value: yearValue,
        label: this._dateAdapter.getYearName(date),
        selected: yearValue === selectedYear,
        current: yearValue === todayYear,
      });

      if (currentRow.length === YEARS_PER_ROW) {
        years.push(currentRow);
        currentRow = [];
      }
    }

    return years;
  });

  selectYear(year: number) {
    const date = this._dateAdapter.createDate(year, 0, 1);
    this.yearSelected.emit(date);
  }
}
