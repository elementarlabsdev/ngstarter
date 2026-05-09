import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from '@ngstarter-ui/components/card';
import { GridItemAware } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';

import { WalletCard } from '../dashboard.types';

@Component({
  selector: 'app-wallet-pockets-grid',
  imports: [Card, Icon],
  templateUrl: './wallet-pockets-grid.html',
  styleUrl: './wallet-pockets-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletPocketsGrid implements GridItemAware {
  readonly id = input.required<string>();
  readonly content = input.required<readonly WalletCard[]>();
}
