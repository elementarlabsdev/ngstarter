import { Component, input, numberAttribute, ChangeDetectionStrategy } from '@angular/core';
import {
  Skeleton,
} from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'ngs-grid-cards-skeleton',
  imports: [
    Skeleton
  ],
  templateUrl: './grid-cards-skeleton.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './grid-cards-skeleton.css'
})
export class GridCardsSkeleton {
  count = input(2, {
    transform: numberAttribute
  });
}
