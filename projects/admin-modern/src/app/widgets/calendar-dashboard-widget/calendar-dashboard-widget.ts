import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Calendar, CalendarEvent } from '@ngstarter-ui/components/calendar';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

@Component({
  selector: 'app-calendar-dashboard-widget',
  imports: [Calendar, WidgetShell],
  templateUrl: './calendar-dashboard-widget.html',
  styleUrl: './calendar-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly selectedDate = signal(new Date());

  protected readonly calendarEvents: readonly CalendarEvent[] = [
    { id: 'launch-readiness', date: this.monthDate(1), color: 'green', title: 'Launch readiness' },
    { id: 'risk-review', date: this.monthDate(5), color: 'rose', title: 'Risk review' },
    { id: 'pipeline-sync', date: this.monthDate(9), color: 'green', title: 'Pipeline sync' },
    { id: 'forecast', date: this.monthDate(16), color: 'blue', title: 'Forecast review' },
    { id: 'customer-health', date: this.monthDate(18), color: 'green', title: 'Customer health' },
    { id: 'renewals', date: this.monthDate(22), color: 'rose', title: 'Renewals' },
    { id: 'finance-close', date: this.monthDate(27), color: 'rose', title: 'Finance close' },
    { id: 'handoff', date: this.monthDate(29), color: 'green', title: 'Handoff' },
  ];

  private monthDate(day: number): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), day);
  }
}
