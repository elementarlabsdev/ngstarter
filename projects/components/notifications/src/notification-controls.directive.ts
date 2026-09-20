import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsNotificationControls]',
  exportAs: 'ngsNotificationControls',
  host: {
    'class': 'ngs-notification-controls'
  }
})
export class NotificationControlsDirective {
}
