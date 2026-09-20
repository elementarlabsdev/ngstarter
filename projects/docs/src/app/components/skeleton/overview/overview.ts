import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSkeletonExample } from '../_examples/basic-skeleton-example/basic-skeleton-example';

@Component({
  imports: [
    Playground,
    BasicSkeletonExample
  ],
    templateUrl: './overview.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './overview.scss'
})
export class Overview {

}
