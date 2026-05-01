import { Component, input } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { NotificationInterface } from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'ngs-mentioned-in-comment',
  imports: [
    Icon,
    Dicebear
  ],
  templateUrl: './mentioned-in-comment.notification.html',
  styleUrl: './mentioned-in-comment.notification.scss'
})
export class MentionedInCommentNotification {
  notification = input.required<NotificationInterface>();
}
