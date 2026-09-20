import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateTitle
} from '@ngstarter-ui/components/empty-state';

@Component({
  selector: 'app-basic-empty-state-example',
  imports: [
    EmptyState,
    EmptyStateTitle,
    EmptyStateContent
  ],
  templateUrl: './basic-empty-state-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-empty-state-example.scss'
})
export class BasicEmptyStateExample {

}
