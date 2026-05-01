import {
  Component,
  input,
  booleanAttribute,
  ChangeDetectionStrategy,
  inject,
  HostListener,
  output,
  ChangeDetectorRef,
  model,
  contentChildren
} from '@angular/core';
import { ListItem } from '../list-item/list-item';
import { SelectionList } from '../selection-list/selection-list';
import { ListItemAvatar } from '../list-item-avatar';
import { ListItemIcon } from '../list-item-icon';
import { ListItemTitle } from '../list-item-title';
import { ListItemLine } from '../list-item-line';
import { ListItemMeta } from '../list-item-meta';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { RadioButton } from '@ngstarter-ui/components/radio';

@Component({
  selector: 'ngs-list-option',
  exportAs: 'ngsListOption',
  imports: [
    Checkbox,
    RadioButton
  ],
  templateUrl: './list-option.html',
  styleUrls: [
    '../list-item/list-item.scss',
    './list-option.scss'
  ],
  host: {
    'class': 'ngs-list-option ngs-list-item',
    '[class.ngs-list-item-disabled]': 'disabled()',
    '[class.ngs-list-option-selected]': 'selected()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled()',
    'role': 'option',
    '[class.ngs-list-item-with-avatar]': '_avatars().length > 0',
    '[class.ngs-list-item-with-icon]': '_icons().length > 0',
    '[class.ngs-list-item-with-meta]': '_meta().length > 0',
    '(click)': '_toggle()',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListOption extends ListItem {
  protected _selectionList = inject(SelectionList);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  override readonly _avatars = contentChildren(ListItemAvatar, { descendants: true });

  override readonly _icons = contentChildren(ListItemIcon, { descendants: true });

  override readonly _meta = contentChildren(ListItemMeta, { descendants: true });

  selected = model(false);

  value = input<any>();

  readonly selectedChange = output<boolean>();

  _toggle() {
    if (this.disabled()) {
      return;
    }

    if (this._selectionList.multiple()) {
      this.selected.set(!this.selected());
      this._selectionList.selectedOptions.toggle(this);
    } else {
      this.selected.set(true);
      this._selectionList.selectedOptions.select(this);
    }
    this.selectedChange.emit(this.selected());
    this._selectionList.selectionChange.emit({
      option: this,
      selected: this.selected()
    });
  }
}
