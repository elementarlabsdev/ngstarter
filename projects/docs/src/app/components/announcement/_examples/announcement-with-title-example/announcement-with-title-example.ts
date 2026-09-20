import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Announcement } from '@ngstarter-ui/components/announcement';

@Component({
  selector: 'app-announcement-with-title-example',
  imports: [
    Announcement
  ],
  templateUrl: './announcement-with-title-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './announcement-with-title-example.scss'
})
export class AnnouncementWithTitleExample {

}
