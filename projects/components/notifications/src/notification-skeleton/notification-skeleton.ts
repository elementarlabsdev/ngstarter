import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Skeleton } from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'ngs-notification-skeleton',
  exportAs: 'ngsNotificationSkeleton',
  imports: [
    Skeleton
  ],
  templateUrl: './notification-skeleton.html',
  styleUrl: './notification-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-notification-skeleton',
  }
})
export class NotificationSkeleton {

}
