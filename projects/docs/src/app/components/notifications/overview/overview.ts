import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicNotificationsExample
} from '../_examples/basic-notifications-example/basic-notifications-example';
import {
  NotificationListExample
} from '../_examples/notification-list-example/notification-list-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicNotificationsExample,
    NotificationListExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
