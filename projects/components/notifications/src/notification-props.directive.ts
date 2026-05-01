import { booleanAttribute, Directive, input } from '@angular/core';

@Directive({
  selector: '[ngsNotificationProps]',
  exportAs: 'ngsNotificationProps',
  standalone: true,
  host: {
    'class': 'ngs-notification-props',
    '[class.is-unread]': 'isUnread()',
  }
})
export class NotificationPropsDirective {
  isUnread = input(false, {
    transform: booleanAttribute
  });
}
