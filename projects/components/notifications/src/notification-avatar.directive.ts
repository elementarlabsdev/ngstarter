import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsNotificationAvatar]',
  exportAs: 'ngsNotificationAvatar',
  host: {
    'class': 'ngs-notification-avatar'
  }
})
export class NotificationAvatarDirective {
}
