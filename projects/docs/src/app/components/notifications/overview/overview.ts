import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicNotificationsExample
} from '../_examples/basic-notifications-example/basic-notifications-example';
import {
  NotificationListExample
} from '../_examples/notification-list-example/notification-list-example';

@Component({
  imports: [
    Playground,
    BasicNotificationsExample,
    NotificationListExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
