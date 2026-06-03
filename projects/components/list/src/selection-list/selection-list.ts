import {
  Component,
  input,
  output,
  booleanAttribute,
  ChangeDetectionStrategy,
  forwardRef,
  OnInit,
  contentChildren
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { List } from '../list/list';
import { ListOption } from '../list-option/list-option';

@Component({
  selector: 'ngs-selection-list',
  exportAs: 'ngsSelectionList',
  templateUrl: './selection-list.html',
  styleUrls: [
    '../list/list.scss',
    './selection-list.scss'
  ],
  providers: [
    { provide: List, useExisting: SelectionList }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-selection-list ngs-list',
    '[attr.aria-disabled]': 'disabled()',
    'role': 'listbox',
    '[attr.aria-multiselectable]': 'multiple()',
  },
})
export class SelectionList extends List implements OnInit {
  readonly options = contentChildren(forwardRef(() => ListOption), { descendants: true });

  multiple = input(false, {
    transform: booleanAttribute
  });

  readonly selectionChange = output<any>();

  selectedOptions!: SelectionModel<ListOption>;

  constructor() {
    super();
  }

  ngOnInit() {
    this.selectedOptions = new SelectionModel<ListOption>(this.multiple());
    this.selectedOptions.changed.subscribe(event => {
      if (this.multiple()) {
        event.added.forEach(option => option.selected.set(true));
        event.removed.forEach(option => option.selected.set(false));
      } else {
        this.options().forEach(option => {
          option.selected.set(this.selectedOptions.isSelected(option));
        });
      }
    });
  }
}
