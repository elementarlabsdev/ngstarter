import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Skeleton,
} from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'app-basic-skeleton-example',
  imports: [
    Skeleton
  ],
  templateUrl: './basic-skeleton-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-skeleton-example.scss'
})
export class BasicSkeletonExample {

}
