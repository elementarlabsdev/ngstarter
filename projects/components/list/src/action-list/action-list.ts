import { Component, HostBinding, Input, booleanAttribute, ChangeDetectionStrategy } from '@angular/core';
import { List } from '../list/list';

@Component({
  selector: 'ngs-action-list',
  exportAs: 'ngsActionList',
  templateUrl: './action-list.html',
  styleUrl: './action-list.scss',
  host: {
    'class': 'ngs-action-list ngs-list',
    '[attr.aria-disabled]': 'disabled',
  },
  providers: [
    { provide: List, useExisting: ActionList }
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionList extends List {
}
