import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngs-notification,[ngs-notification]',
  exportAs: 'ngsNotification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification',
    '[class.is-unread]': 'isUnread()'
  }
})
export class Notification {
  isUnread = input(false, {
    transform: booleanAttribute
  });
}
