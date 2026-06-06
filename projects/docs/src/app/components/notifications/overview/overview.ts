import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicNotificationsExample
} from '../_examples/basic-notifications-example/basic-notifications-example';
import {
  NotificationListExample
} from '../_examples/notification-list-example/notification-list-example';
import {
  NotificationVariantsExample
} from '../_examples/notification-variants-example/notification-variants-example';

@Component({
  imports: [
    Playground,
    BasicNotificationsExample,
    NotificationListExample,
    NotificationVariantsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
