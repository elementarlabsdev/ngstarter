import { Component } from '@angular/core';
import {
  NotificationAvatarDirective,
  NotificationActor,
  Notification,
  NotificationMessage,
  NotificationTime, NotificationContent
} from '@ngstarter/components/notifications';
import { Dicebear } from '@ngstarter/components/avatar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-basic-notifications-example',
  imports: [
    Notification,
    Dicebear,
    NotificationAvatarDirective,
    NotificationMessage,
    NotificationTime,
    RouterLink,
    NotificationActor,
    NotificationContent
  ],
  templateUrl: './basic-notifications-example.html',
  styleUrl: './basic-notifications-example.scss'
})
export class BasicNotificationsExample {
  notifications: any[] = [
    {
      actor: {
        id: 1,
        name: 'Justin Hansen',
        username: 'justin.hansen',
        avatarUrl: 'assets/avatars/5.svg'
      },
      notifier: {
        id: 2,
        name: 'Elma Johnson',
        username: 'elma.johnson',
        avatarUrl: 'assets/avatars/2.svg'
      },
      payload: {
        message: 'what did you say?'
      },
      type: 'mentionedInComment',
      createdAt: '1 hour ago'
    }
  ];
}
