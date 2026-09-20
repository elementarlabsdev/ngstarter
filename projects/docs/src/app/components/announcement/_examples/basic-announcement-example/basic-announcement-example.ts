import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Announcement } from '@ngstarter-ui/components/announcement';

@Component({
  selector: 'app-basic-announcement-example',
  imports: [
    Announcement
  ],
  templateUrl: './basic-announcement-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-announcement-example.scss'
})
export class BasicAnnouncementExample {

}
