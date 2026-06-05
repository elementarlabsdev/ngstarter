import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

export type CalendarDateInput = Date | string | number;

export type CalendarEventColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'green'
  | 'rose'
  | 'blue';

export interface CalendarEvent {
  readonly id?: string | number;
  readonly date: CalendarDateInput;
  readonly title?: string;
  readonly color?: CalendarEventColor;
}

interface CalendarCell {
  readonly date: Date;
  readonly key: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly inCurrentMonth: boolean;
  readonly visible: boolean;
  readonly today: boolean;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly events: readonly CalendarEvent[];
  readonly markers: readonly CalendarEventColor[];
}

@Component({
  selector: 'ngs-calendar',
  exportAs: 'ngsCalendar',
  imports: [Button, Icon],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-calendar',
  },
})
export class Calendar {
  readonly startAt = input<CalendarDateInput | null>(null);
  readonly selected = input<CalendarDateInput | null>(null);
  readonly minDate = input<CalendarDateInput | null>(null);
  readonly maxDate = input<CalendarDateInput | null>(null);
  readonly events = input<readonly CalendarEvent[]>([]);
  readonly locale = input<string | undefined>(undefined);
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly showAdjacentDays = input(true, { transform: booleanAttribute });
  readonly showTodayButton = input(true, { transform: booleanAttribute });
  readonly showEventTitles = input(false, { transform: booleanAttribute });

  readonly selectedChange = output<Date>();
  readonly monthChange = output<Date>();
  readonly eventSelected = output<CalendarEvent>();

  protected readonly activeMonth = signal(this.getInitialActiveMonth());
  protected readonly selectedDate = signal<Date | null>(this.normalizeDateInput(this.selected()));

  protected readonly normalizedMinDate = computed(() => this.normalizeDateInput(this.minDate()));
  protected readonly normalizedMaxDate = computed(() => this.normalizeDateInput(this.maxDate()));

  protected readonly periodLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      month: 'long',
      year: 'numeric',
    }).format(this.activeMonth()),
  );

  protected readonly weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const labels: string[] = [];
    const weekStart = this.normalizedFirstDayOfWeek();

    for (let index = 0; index < 7; index++) {
      const date = new Date(2024, 0, 7 + weekStart + index);
      labels.push(formatter.format(date));
    }

    return labels;
  });

  protected readonly calendarCells = computed<readonly CalendarCell[]>(() => {
    const activeMonth = this.activeMonth();
    const selectedDate = this.selectedDate();
    const minDate = this.normalizedMinDate();
    const maxDate = this.normalizedMaxDate();
    const showAdjacentDays = this.showAdjacentDays();
    const monthStart = this.startOfMonth(activeMonth);
    const weekStart = this.normalizedFirstDayOfWeek();
    const firstDayOffset = (monthStart.getDay() - weekStart + 7) % 7;
    const gridStart = this.addDays(monthStart, -firstDayOffset);
    const today = this.startOfDay(new Date());
    const eventMap = this.eventsByDate();
    const cells: CalendarCell[] = [];

    for (let index = 0; index < 42; index++) {
      const date = this.addDays(gridStart, index);
      const inCurrentMonth = this.sameMonth(date, activeMonth);
      const events = eventMap.get(this.dateKey(date)) ?? [];
      const visible = inCurrentMonth || showAdjacentDays;

      cells.push({
        date,
        key: this.dateKey(date),
        label: visible ? String(date.getDate()) : '',
        ariaLabel: this.formatFullDate(date),
        inCurrentMonth,
        visible,
        today: this.sameDate(date, today),
        selected: !!selectedDate && this.sameDate(date, selectedDate),
        disabled: this.isDisabled(date, minDate, maxDate) || !visible,
        events,
        markers: this.uniqueEventColors(events),
      });
    }

    return cells;
  });

  constructor() {
    effect(() => {
      const selected = this.normalizeDateInput(this.selected());

      this.selectedDate.set(selected);

      if (selected) {
        this.activeMonth.set(this.startOfMonth(selected));
      }
    });

    effect(() => {
      const startAt = this.normalizeDateInput(this.startAt());

      if (startAt) {
        this.activeMonth.set(this.startOfMonth(startAt));
      }
    });
  }

  protected previousMonth(): void {
    this.setActiveMonth(this.addMonths(this.activeMonth(), -1));
  }

  protected nextMonth(): void {
    this.setActiveMonth(this.addMonths(this.activeMonth(), 1));
  }

  protected selectToday(): void {
    const today = this.startOfDay(new Date());

    this.setActiveMonth(today);

    if (!this.isDisabled(today, this.normalizedMinDate(), this.normalizedMaxDate())) {
      this.selectDate(today);
    }
  }

  protected selectCell(cell: CalendarCell): void {
    if (cell.disabled) {
      return;
    }

    if (!cell.inCurrentMonth) {
      this.setActiveMonth(cell.date);
    }

    this.selectDate(cell.date);
  }

  protected selectEvent(event: CalendarEvent, domEvent: MouseEvent): void {
    domEvent.stopPropagation();
    this.eventSelected.emit(event);
  }

  protected markerClass(color: CalendarEventColor): string {
    return `ngs-calendar-event-${color}`;
  }

  private selectDate(date: Date): void {
    const value = this.startOfDay(date);

    this.selectedDate.set(value);
    this.selectedChange.emit(this.cloneDate(value));
  }

  private setActiveMonth(date: Date): void {
    const month = this.startOfMonth(date);

    this.activeMonth.set(month);
    this.monthChange.emit(this.cloneDate(month));
  }

  private getInitialActiveMonth(): Date {
    return this.startOfMonth(
      this.normalizeDateInput(this.selected()) ??
        this.normalizeDateInput(this.startAt()) ??
        new Date(),
    );
  }

  private eventsByDate(): Map<string, CalendarEvent[]> {
    const map = new Map<string, CalendarEvent[]>();

    for (const event of this.events()) {
      const date = this.normalizeDateInput(event.date);

      if (!date) {
        continue;
      }

      const key = this.dateKey(date);
      const events = map.get(key) ?? [];
      events.push(event);
      map.set(key, events);
    }

    return map;
  }

  private uniqueEventColors(events: readonly CalendarEvent[]): readonly CalendarEventColor[] {
    const colors = new Set<CalendarEventColor>();

    for (const event of events) {
      colors.add(event.color ?? 'primary');
    }

    return [...colors].slice(0, 3);
  }

  private normalizedFirstDayOfWeek(): number {
    const value = this.firstDayOfWeek();

    if (!Number.isFinite(value)) {
      return 0;
    }

    return ((Math.trunc(value) % 7) + 7) % 7;
  }

  private normalizeDateInput(value: CalendarDateInput | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : this.startOfDay(value);
    }

    if (typeof value === 'string') {
      const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

      if (dateOnly) {
        const year = Number(dateOnly[1]);
        const month = Number(dateOnly[2]) - 1;
        const day = Number(dateOnly[3]);
        const date = new Date(year, month, day);

        return Number.isNaN(date.getTime()) ? null : this.startOfDay(date);
      }
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : this.startOfDay(date);
  }

  private isDisabled(date: Date, minDate: Date | null, maxDate: Date | null): boolean {
    return (
      (!!minDate && this.compareDate(date, minDate) < 0) ||
      (!!maxDate && this.compareDate(date, maxDate) > 0)
    );
  }

  private formatFullDate(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private cloneDate(date: Date): Date {
    return new Date(date.getTime());
  }

  private sameMonth(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
  }

  private sameDate(first: Date, second: Date): boolean {
    return this.compareDate(first, second) === 0;
  }

  private compareDate(first: Date, second: Date): number {
    return (
      first.getFullYear() - second.getFullYear() ||
      first.getMonth() - second.getMonth() ||
      first.getDate() - second.getDate()
    );
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
