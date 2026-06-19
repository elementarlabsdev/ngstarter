import { Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';

interface MenuAction {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-data-driven-menu-example',
  imports: [
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger
  ],
  templateUrl: './data-driven-menu-example.html',
  styleUrl: './data-driven-menu-example.scss'
})
export class DataDrivenMenuExample {
  readonly selectedAction = signal('No action selected');

  readonly actions: MenuAction[] = [
    { id: 'open', label: 'Open project', icon: 'fluent:open-24-regular' },
    { id: 'duplicate', label: 'Duplicate', icon: 'fluent:copy-24-regular' },
    { id: 'archive', label: 'Archive', icon: 'fluent:archive-24-regular' },
    { id: 'delete', label: 'Delete', icon: 'fluent:delete-24-regular', disabled: true }
  ];

  selectAction(action: MenuAction): void {
    this.selectedAction.set(action.label);
  }
}
