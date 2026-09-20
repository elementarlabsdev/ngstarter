import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  NotificationAvatarDirective,
  NotificationActor,
  Notification,
  NotificationMessage,
  NotificationContent,
  NotificationControlsDirective,
  NotificationTime
} from '@ngstarter-ui/components/notifications';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Icon } from '@ngstarter-ui/components/icon';
import { RouterLink } from '@angular/router';
import { NotificationActionsExample } from '../notification-actions-example/notification-actions-example';

@Component({
  selector: 'app-basic-notifications-example',
  imports: [
    Notification,
    Avatar,
    NotificationAvatarDirective,
    NotificationMessage,
    NotificationTime,
    RouterLink,
    NotificationActor,
    NotificationContent,
    NotificationControlsDirective,
    NotificationActionsExample,
    Icon
  ],
  templateUrl: './basic-notifications-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-notifications-example.scss'
})
export class BasicNotificationsExample {
}
