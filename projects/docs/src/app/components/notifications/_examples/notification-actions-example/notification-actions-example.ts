import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';

@Component({
  selector: 'app-notification-actions',
  imports: [
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger
  ],
  templateUrl: './notification-actions-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationActionsExample {
}
