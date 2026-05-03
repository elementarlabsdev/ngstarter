import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicAnnouncementExample
} from '../_examples/basic-announcement-example/basic-announcement-example';
import {
  AnnouncementWithIconsExample
} from '../_examples/announcement-with-icons-example/announcement-with-icons-example';
import {
  AnnouncementWithTitleExample
} from '../_examples/announcement-with-title-example/announcement-with-title-example';
import {
  ShowHideAnnouncementDynamically
} from '../_examples/show-hide-announcement-dynamically/show-hide-announcement-dynamically';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicAnnouncementExample,
    AnnouncementWithIconsExample,
    AnnouncementWithTitleExample,
    ShowHideAnnouncementDynamically,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
