import { Component } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import {
  NotificationAvatarDirective,
  NotificationActor,
  Notification,
  NotificationControlsDefDirective,
  NotificationDefDirective,
  NotificationList,
  NotificationMessage,
  NotificationTime,
  NotificationContent
} from '@ngstarter-ui/components/notifications';
import { Icon } from '@ngstarter-ui/components/icon';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notification-list-example',
  imports: [

    Icon,
    MenuItem,
    Menu,
    NotificationControlsDefDirective,
    NotificationDefDirective,
    NotificationList,
    MenuTrigger,
    Notification,
    Dicebear,
    NotificationAvatarDirective,
    NotificationActor,
    NotificationMessage,
    NotificationTime,
    RouterLink,
    NotificationContent
  ],
  templateUrl: './notification-list-example.html',
  styleUrl: './notification-list-example.scss'
})
export class NotificationListExample {
  notifications: any[] = [
    {
      actor: {
        id: 1,
        name: 'Justin Hansen',
        username: 'justin.hansen',
        avatarUrl: 'assets/avatars/6.svg'
      },
      notifier: {
        id: 2,
        name: 'Elma Johnson',
        username: 'elma.johnson',
        avatarUrl: 'assets/avatars/4.svg'
      },
      message: 'what did you say?',
      isUnread: true,
      type: 'mentionedInComment',
      createdAt: '1 hour ago'
    },
    {
      actor: {
        id: 3,
        name: 'Johnny Gladden',
        username: 'johnny.gladden',
        avatarUrl: 'assets/avatars/3.svg'
      },
      notifier: {
        id: 4,
        name: 'Angela Naylor',
        username: 'angela.naylor',
        avatarUrl: 'assets/avatars/1.svg'
      },
      payload: {
        folderName: 'My New Project'
      },
      isUnread: true,
      type: 'inviteToEditFilesInFolder',
      createdAt: '2 hours ago'
    },
    {
      actor: {
        id: 1,
        name: 'Justin Hansen',
        username: 'justin.hansen',
        avatarUrl: 'assets/avatars/7.svg'
      },
      notifier: {
        id: 2,
        name: 'Elma Johnson',
        username: 'elma.johnson',
        avatarUrl: 'assets/avatars/8.svg'
      },
      payload: {
        content: 'what did you say?'
      },
      type: 'mentionedInComment',
      createdAt: '1 hour ago'
    },
  ];
}
