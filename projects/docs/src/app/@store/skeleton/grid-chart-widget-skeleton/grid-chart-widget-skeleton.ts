import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Skeleton } from '@ngstarter-ui/components/skeleton';

@Component({
  selector: 'ngs-grid-chart-content-skeleton',
  imports: [
    Skeleton
  ],
  templateUrl: './grid-chart-widget-skeleton.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './grid-chart-widget-skeleton.css'
})
export class GridChartWidgetSkeleton {

}
