import {
  Component,
  input,
  booleanAttribute,
  ChangeDetectionStrategy,
  inject,
  numberAttribute,
  contentChildren
} from '@angular/core';
import { Ripple } from '@ngstarter/components/core';
import { List } from '../list/list';
import { ListItemAvatar } from '../list-item-avatar';
import { ListItemIcon } from '../list-item-icon';
import { ListItemTitle } from '../list-item-title';
import { ListItemLine } from '../list-item-line';
import { ListItemMeta } from '../list-item-meta';

@Component({
  selector: 'ngs-list-item, a[ngs-list-item], button[ngs-list-item]',
  exportAs: 'ngsListItem',
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
  hostDirectives: [
    {
      directive: Ripple,
      inputs: ['ngsRippleDisabled: disableRipple']
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-list-item',
    '[class.ngs-list-item-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled()',
    '[class.ngs-list-item-with-avatar]': '_avatars().length > 0',
    '[class.ngs-list-item-with-icon]': '_icons().length > 0',
    '[class.ngs-list-item-with-meta]': '_meta().length > 0',
    '[attr.data-lines]': 'lines()',
  },
})
export class ListItem {
  private _list = inject(List, { optional: true });

  disabled = input(false, {
    transform: booleanAttribute
  });
  lines = input<number | null, any>(null, {
    transform: numberAttribute
  });

  readonly _avatars = contentChildren(ListItemAvatar, { descendants: true });
  readonly _icons = contentChildren(ListItemIcon, { descendants: true });
  readonly _titles = contentChildren(ListItemTitle, { descendants: true });
  readonly _lines = contentChildren(ListItemLine, { descendants: true });
  readonly _meta = contentChildren(ListItemMeta, { descendants: true });

  get disableRipple() {
    return this.disabled() || this._list?.disableRipple();
  }
}
