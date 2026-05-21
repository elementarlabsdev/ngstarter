import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chip } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

interface ChannelScore {
  readonly label: string;
  readonly detail: string;
  readonly value: number;
  readonly className: string;
}

@Component({
  selector: 'app-audience-dashboard-widget',
  imports: [Chip, Icon, ProgressBar, WidgetShell],
  templateUrl: './audience-dashboard-widget.html',
  styleUrl: './audience-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudienceDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly channels: readonly ChannelScore[] = [
    { label: 'Social snippets', detail: 'Short-form hooks', value: 92, className: 'channel-social' },
    { label: 'Email angles', detail: 'Subject line variants', value: 76, className: 'channel-email' },
    { label: 'Landing copy', detail: 'Hero and proof blocks', value: 84, className: 'channel-landing' },
  ];
}
