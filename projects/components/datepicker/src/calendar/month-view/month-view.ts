import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
  signal,
} from '@angular/core';
import { DateAdapter } from '../../core/datetime/date-adapter';
import { DateRange } from '../../core/datetime/date-range';

@Component({
  selector: 'ngs-month-view',
  exportAs: 'ngsMonthView',
  templateUrl: './month-view.html',
  styleUrl: './month-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-month-view',
    '(mouseleave)': 'handleHover(null)'
  },
})
export class MonthView<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  readonly activeDate = input.required<D>();
  readonly selected = input<D | DateRange<D> | null>(null);
  readonly minDate = input<D | null>(null);
  readonly maxDate = input<D | null>(null);
  readonly rangePreviewDate = input<D | null>(null);
  readonly sharedRangePreview = input<boolean>(false);

  readonly selectedChange = output<D>();
  readonly rangePreviewDateChange = output<D | null>();

  readonly _hoveredDate = signal<D | null>(null);
  readonly hoveredDate = this._hoveredDate;

  readonly weekdays = computed(() => {
    return this._dateAdapter.getDayOfWeekNames('short');
  });

  readonly weeks = computed(() => {
    const activeDate = this.activeDate();
    const hoveredDate = this.sharedRangePreview()
      ? this.rangePreviewDate()
      : this._hoveredDate();
    const firstDayOfMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(activeDate),
      this._dateAdapter.getMonth(activeDate),
      1
    );
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(activeDate);
    const firstDayOfWeek = this._dateAdapter.getDayOfWeek(firstDayOfMonth);

    const weeks: {
      date: D | null;
      label: string;
      selected: boolean;
      current: boolean;
      inRange: boolean;
      rangeStart: boolean;
      rangeEnd: boolean;
    }[][] = [];
    let currentWeek: any[] = [];

    // Offset for the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: null, label: '', selected: false, current: false, inRange: false, rangeStart: false, rangeEnd: false });
    }

    const today = this._dateAdapter.today();
    const selected = this.selected();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = this._dateAdapter.createDate(
        this._dateAdapter.getYear(activeDate),
        this._dateAdapter.getMonth(activeDate),
        i
      );

      let isSelected = false;
      let inRange = false;
      let rangeStart = false;
      let rangeEnd = false;

      if (selected instanceof DateRange) {
        if (selected.start && selected.end) {
          inRange = this._dateAdapter.compareDate(date, selected.start) >= 0 &&
                    this._dateAdapter.compareDate(date, selected.end) <= 0;
          rangeStart = this._dateAdapter.sameDate(date, selected.start);
          rangeEnd = this._dateAdapter.sameDate(date, selected.end);
        } else if (selected.start) {
          isSelected = this._dateAdapter.sameDate(date, selected.start);
          rangeStart = isSelected;

          if (hoveredDate) {
            const comparison = this._dateAdapter.compareDate(date, selected.start);
            const hoverComparison = this._dateAdapter.compareDate(date, hoveredDate);

            if (this._dateAdapter.compareDate(hoveredDate, selected.start) >= 0) {
              inRange = comparison >= 0 && hoverComparison <= 0;
              rangeEnd = this._dateAdapter.sameDate(date, hoveredDate);
            } else {
              inRange = comparison <= 0 && hoverComparison >= 0;
              rangeStart = this._dateAdapter.sameDate(date, hoveredDate);
              rangeEnd = isSelected;
            }
          }
        } else if (selected.end) {
          isSelected = this._dateAdapter.sameDate(date, selected.end);
          rangeEnd = isSelected;
        }
      } else {
        isSelected = this._dateAdapter.sameDate(date, selected);
      }

      currentWeek.push({
        date,
        label: i.toString(),
        selected: isSelected,
        current: this._dateAdapter.sameDate(date, today),
        inRange,
        rangeStart,
        rangeEnd
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, label: '', selected: false, current: false, inRange: false, rangeStart: false, rangeEnd: false });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  });

  selectDate(date: D | null) {
    if (date) {
      this.selectedChange.emit(date);
    }
  }

  handleHover(date: D | null) {
    this._hoveredDate.set(date);
    this.rangePreviewDateChange.emit(date);
  }
}
