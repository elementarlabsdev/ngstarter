import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { CalendarDay, DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

@Component({
  selector: 'app-calendar-dashboard-widget',
  imports: [Button, Icon, Tooltip, WidgetShell],
  templateUrl: './calendar-dashboard-widget.html',
  styleUrl: './calendar-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly calendarDays: readonly CalendarDay[] = [
    { day: '1', marker: 'green' },
    { day: '2' },
    { day: '3' },
    { day: '4' },
    { day: '5', marker: 'rose' },
    { day: '6' },
    { day: '7', state: 'muted' },
    { day: '8' },
    { day: '9', marker: 'green' },
    { day: '10' },
    { day: '11', state: 'active' },
    { day: '12' },
    { day: '13', state: 'muted' },
    { day: '14', state: 'muted' },
    { day: '15' },
    { day: '16', marker: 'blue' },
    { day: '17' },
    { day: '18', marker: 'green' },
    { day: '19' },
    { day: '20', state: 'muted' },
    { day: '21', state: 'muted' },
    { day: '22', marker: 'rose' },
    { day: '23' },
    { day: '24' },
    { day: '25' },
    { day: '26' },
    { day: '27', marker: 'rose' },
    { day: '28', state: 'muted' },
    { day: '29', marker: 'green' },
    { day: '30' },
    { day: '31' },
    { day: '1', state: 'muted' },
    { day: '2', state: 'muted' },
    { day: '3', state: 'muted' },
    { day: '4', state: 'muted' },
  ];
}
