import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-notification-message',
  exportAs: 'ngsNotificationMessage',
  imports: [],
  templateUrl: './notification-message.html',
  styleUrl: './notification-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification-message'
  }
})
export class NotificationMessage {

}
