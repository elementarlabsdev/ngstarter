import { Component, computed, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { AnnouncementStore } from '@ngstarter-ui/components/announcement';

@Component({
  selector: 'app-show-hide-announcement-dynamically',
  imports: [
    Button
  ],
  templateUrl: './show-hide-announcement-dynamically.html',
  styleUrl: './show-hide-announcement-dynamically.scss'
})
export class ShowHideAnnouncementDynamically {
  private _announcementStore = inject(AnnouncementStore);
  visible = computed(() => {
    return !!this._announcementStore.announcement();
  });

  showAnnouncement() {
    this._announcementStore.show({
      title: 'Warning!',
      message: 'You still have not uploaded your Mart invoice due on 22 April 2025',
      variant: 'warning',
      iconName: 'fluent:warning-24-regular',
      linkTo: {
        url: 'https://ngstarter.com',
        text: 'Update Now'
      }
    });
  }

  hideAnnouncement() {
    this._announcementStore.hide();
  }
}
