import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

@Component({
  selector: 'app-map-dashboard-widget',
  imports: [Button, WidgetShell],
  templateUrl: './map-dashboard-widget.html',
  styleUrl: './map-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();
}
