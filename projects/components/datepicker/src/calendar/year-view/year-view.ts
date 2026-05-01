import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
} from '@angular/core';
import { DateAdapter } from '../../core/datetime/date-adapter';

@Component({
  selector: 'ngs-year-view',
  standalone: true,
  templateUrl: './year-view.html',
  styleUrl: './year-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-year-view',
  },
})
export class YearView<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  readonly activeDate = input.required<D>();
  readonly selected = input<D | null>(null);

  readonly monthSelected = output<D>();

  readonly months = computed(() => {
    const activeDate = this.activeDate();
    const monthNames = this._dateAdapter.getMonthNames('short');
    const today = this._dateAdapter.today();
    const currentYear = this._dateAdapter.getYear(activeDate);
    const selectedYear = this.selected() ? this._dateAdapter.getYear(this.selected()!) : null;
    const selectedMonth = this.selected() ? this._dateAdapter.getMonth(this.selected()!) : null;
    const todayYear = this._dateAdapter.getYear(today);
    const todayMonth = this._dateAdapter.getMonth(today);

    const months: { index: number; label: string; selected: boolean; current: boolean }[][] = [];
    let currentRow: any[] = [];

    for (let i = 0; i < 12; i++) {
      currentRow.push({
        index: i,
        label: monthNames[i],
        selected: currentYear === selectedYear && i === selectedMonth,
        current: currentYear === todayYear && i === todayMonth,
      });

      if (currentRow.length === 4) {
        months.push(currentRow);
        currentRow = [];
      }
    }

    return months;
  });

  selectMonth(month: number) {
    const date = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.activeDate()),
      month,
      1
    );
    this.monthSelected.emit(date);
  }
}
