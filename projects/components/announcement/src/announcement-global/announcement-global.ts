import { Component, computed, inject, output } from '@angular/core';
import { AnnouncementStore } from '../announcement.store';
import { AnnouncementData as AnnouncementInterface } from '../types';
import { Announcement } from '../announcement/announcement';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-announcement-global',
  exportAs: 'ngsAnnouncementGlobal',
  imports: [
    Announcement,
    SafeHtmlPipe
  ],
  templateUrl: './announcement-global.html',
  styleUrl: './announcement-global.scss'
})
export class AnnouncementGlobal {
  private _announcementStore = inject(AnnouncementStore);

  announcement = computed<AnnouncementInterface>(() => {
    return this._announcementStore.announcement() as AnnouncementInterface;
  });

  readonly announcementClose = output<void>();

  onClose() {
    this._announcementStore.hide();
  }
}
