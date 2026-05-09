import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from '@ngstarter-ui/components/card';
import { GridItemAware } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

import { AssetItem } from '../dashboard.types';

@Component({
  selector: 'app-pocket-asset-breakdown',
  imports: [Card, Icon],
  templateUrl: './pocket-asset-breakdown.html',
  styleUrl: './pocket-asset-breakdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PocketAssetBreakdown implements GridItemAware {
  readonly id = input.required<string>();
  readonly content = input.required<readonly AssetItem[]>();
}
