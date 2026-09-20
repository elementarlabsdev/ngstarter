import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { NotificationInterface } from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'ngs-invite-to-edit-files-in-folder',
  imports: [
    Icon,
    Avatar
  ],
  templateUrl: './invite-to-edit-files-in-folder.notification.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invite-to-edit-files-in-folder.notification.scss'
})
export class InviteToEditFilesInFolderNotification {
  notification = input.required<NotificationInterface>();
}
