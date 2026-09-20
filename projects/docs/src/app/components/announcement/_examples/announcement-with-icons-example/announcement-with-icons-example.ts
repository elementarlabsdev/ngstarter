import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Announcement } from '@ngstarter-ui/components/announcement';

@Component({
  selector: 'app-announcement-with-icons-example',
  imports: [
    Announcement
  ],
  templateUrl: './announcement-with-icons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './announcement-with-icons-example.scss'
})
export class AnnouncementWithIconsExample {

}
