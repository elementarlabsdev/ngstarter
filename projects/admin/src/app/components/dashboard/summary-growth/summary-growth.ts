import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card } from '@ngstarter-ui/components/card';
import { GridItemAware } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

import { GrowthSummary } from '../dashboard.types';

@Component({
  selector: 'app-summary-growth',
  imports: [Button, Card, Icon],
  templateUrl: './summary-growth.html',
  styleUrl: './summary-growth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryGrowth implements GridItemAware {
  readonly id = input.required<string>();
  readonly content = input.required<GrowthSummary>();
}
