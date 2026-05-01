import { Component } from '@angular/core';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateTitle
} from '@ngstarter/components/empty-state';

@Component({
  selector: 'app-basic-empty-state-example',
  imports: [
    EmptyState,
    EmptyStateTitle,
    EmptyStateContent
  ],
  templateUrl: './basic-empty-state-example.html',
  styleUrl: './basic-empty-state-example.scss'
})
export class BasicEmptyStateExample {

}
