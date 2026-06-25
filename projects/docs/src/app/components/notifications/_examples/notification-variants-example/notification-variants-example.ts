import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import { Chip } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Notification,
  NotificationActor,
  NotificationAvatarDirective,
  NotificationContent,
  NotificationMessage,
  NotificationTime
} from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'app-notification-variants-example',
  imports: [
    Button,
    Chip,
    Avatar,
    Icon,
    Notification,
    NotificationActor,
    NotificationAvatarDirective,
    NotificationContent,
    NotificationMessage,
    NotificationTime,
    RouterLink
  ],
  templateUrl: './notification-variants-example.html',
  styleUrl: './notification-variants-example.scss'
})
export class NotificationVariantsExample {
}
