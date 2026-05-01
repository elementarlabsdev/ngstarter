import { Component, input } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Dicebear } from '@ngstarter/components/avatar';
import { NotificationInterface } from '@ngstarter/components/notifications';

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
