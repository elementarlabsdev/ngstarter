import { Component, input } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { NotificationInterface } from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'ngs-invite-to-edit-files-in-folder',
  imports: [
    Icon,
    Dicebear
  ],
  templateUrl: './invite-to-edit-files-in-folder.notification.html',
  styleUrl: './invite-to-edit-files-in-folder.notification.scss'
})
export class InviteToEditFilesInFolderNotification {
  notification = input.required<NotificationInterface>();
}
