import { Component } from '@angular/core';
import { InviteToEditFilesInFolderNotification, MentionedInCommentNotification } from '@store/notifications';
import { RouterLink } from '@angular/router';
import { Icon } from '@ngstarter-ui/components/icon';
import { Popover } from '@ngstarter-ui/components/popover';
import { NotificationDefDirective, NotificationList, NotificationInterface } from '@ngstarter-ui/components/notifications';
import { Button } from '@ngstarter-ui/components/button';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-notifications-popover',
  imports: [
    Popover,
    InviteToEditFilesInFolderNotification,
    MentionedInCommentNotification,
    NotificationDefDirective,
    NotificationList,
    RouterLink,
    Icon,
    Button,
    Ripple
  ],
  templateUrl: './notifications-popover.html',
  styleUrl: './notifications-popover.scss'
})
export class NotificationsPopover {
  notifications: NotificationInterface[] = [
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
        content: 'what did you say?'
      },
      type: 'mentionedInComment',
      createdAt: '1 hour ago'
    },
    {
      actor: {
        id: 3,
        name: 'Johnny Gladden',
        username: 'johnny.gladden',
        avatarUrl: 'assets/avatars/6.svg'
      },
      notifier: {
        id: 4,
        name: 'Angela Naylor',
        username: 'angela.naylor',
        avatarUrl: 'assets/avatars/3.svg'
      },
      payload: {
        folderName: 'My New Project'
      },
      type: 'inviteToEditFilesInFolder',
      createdAt: '2 hours ago'
    }
  ];
}
