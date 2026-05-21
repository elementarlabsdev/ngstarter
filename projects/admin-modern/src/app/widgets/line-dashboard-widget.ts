import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { DashboardWidgetContent } from './widget-content';
import { WidgetShell } from './widget-shell';

@Component({
  selector: 'app-line-dashboard-widget',
  imports: [MchartLine, WidgetShell],
  templateUrl: './line-dashboard-widget.html',
  styleUrl: './line-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly lineData = [14, 11, 15, 13, 18, 22, 19, 16, 21, 24, 20, 23];
}
