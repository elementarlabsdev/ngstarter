import { booleanAttribute, ChangeDetectionStrategy, Component, contentChild, input } from '@angular/core';
import { NotificationControlsDirective } from '../notification-controls.directive';

@Component({
  selector: 'ngs-notification,[ngs-notification]',
  exportAs: 'ngsNotification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification',
    '[class.is-unread]': 'isUnread()',
    '[class.has-controls]': '!!controls()'
  }
})
export class Notification {
  readonly controls = contentChild(NotificationControlsDirective);

  isUnread = input(false, {
    transform: booleanAttribute
  });
}
