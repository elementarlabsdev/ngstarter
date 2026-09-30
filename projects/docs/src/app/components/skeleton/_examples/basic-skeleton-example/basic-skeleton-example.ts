import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonRectangle,
} from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'app-basic-skeleton-example',
  imports: [
    Skeleton,
    SkeletonCircle,
    SkeletonRectangle
  ],
  templateUrl: './basic-skeleton-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './basic-skeleton-example.scss'
})
export class BasicSkeletonExample {

}
