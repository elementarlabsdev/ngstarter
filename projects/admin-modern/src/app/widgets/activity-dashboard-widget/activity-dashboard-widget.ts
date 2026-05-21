import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

@Component({
  selector: 'app-activity-dashboard-widget',
  imports: [Button, Icon, WidgetShell],
  templateUrl: './activity-dashboard-widget.html',
  styleUrl: './activity-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();
}
