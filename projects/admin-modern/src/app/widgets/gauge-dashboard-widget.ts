import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chip } from '@ngstarter-ui/components/chips';
import { WidgetShell } from './widget-shell';
import { DashboardWidgetContent } from './widget-content';

@Component({
  selector: 'app-gauge-dashboard-widget',
  imports: [Chip, WidgetShell],
  templateUrl: './gauge-dashboard-widget.html',
  styleUrl: './gauge-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaugeDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();
}
