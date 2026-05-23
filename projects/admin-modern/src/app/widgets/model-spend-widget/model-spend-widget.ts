import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chip, ChipShape } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

interface SpendLane {
  readonly label: string;
  readonly detail: string;
  readonly value: number;
  readonly className: string;
}

@Component({
  selector: 'app-model-spend-widget',
  imports: [Chip, ChipShape, Icon, ProgressBar, WidgetShell],
  templateUrl: './model-spend-widget.html',
  styleUrl: './model-spend-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelSpendWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly lanes: readonly SpendLane[] = [
    { label: 'Text models', detail: 'Drafting and rewrite passes', value: 58, className: 'lane-text' },
    // { label: 'Image models', detail: 'Concept boards and variants', value: 27, className: 'lane-image' },
    // { label: 'Review tools', detail: 'Safety, brand, and legal checks', value: 15, className: 'lane-review' },
  ];
}
