import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card } from '@ngstarter-ui/components/card';
import { GridItemAware } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

import { AlertStat } from '../dashboard.types';

@Component({
  selector: 'app-smart-spending-alerts',
  imports: [Button, Card, Icon],
  templateUrl: './smart-spending-alerts.html',
  styleUrl: './smart-spending-alerts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartSpendingAlerts implements GridItemAware {
  readonly id = input.required<string>();
  readonly content = input.required<readonly AlertStat[]>();
}
