import { Component, input } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Dicebear } from '@ngstarter/components/avatar';
import { NotificationInterface } from '@ngstarter/components/notifications';

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
