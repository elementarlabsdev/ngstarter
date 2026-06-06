import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-notification-content,[ngs-notification-content]',
  exportAs: 'ngsNotificationContent',
  imports: [],
  templateUrl: './notification-content.html',
  styleUrl: './notification-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification-content'
  }
})
export class NotificationContent {

}
