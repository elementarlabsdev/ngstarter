import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-notification-time,[ngs-notification-time]',
  exportAs: 'ngsNotificationTime',
  imports: [],
  templateUrl: './notification-time.html',
  styleUrl: './notification-time.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification-time'
  }
})
export class NotificationTime {

}
