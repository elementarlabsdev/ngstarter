import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';
import { GenerationLatencyChart } from './generation-latency-chart/generation-latency-chart';

@Component({
  selector: 'app-line-dashboard-widget',
  imports: [GenerationLatencyChart, WidgetShell],
  templateUrl: './line-dashboard-widget.html',
  styleUrl: './line-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly labels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  protected readonly latencyData = [1.45, 1.32, 1.72, 2.4, 1.64, 1.9];
}
