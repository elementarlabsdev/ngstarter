import { Component } from '@angular/core';
import {
  EmptyStateActions,
  EmptyState,
  EmptyStateContent,
  EmptyStateTitle
} from '@ngstarter-ui/components/empty-state';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-empty-state-with-actions-example',
  imports: [
    EmptyState,
    EmptyStateContent,
    EmptyStateTitle,
    EmptyStateActions,
    Button
  ],
  templateUrl: './empty-state-with-actions-example.html',
  styleUrl: './empty-state-with-actions-example.scss'
})
export class EmptyStateWithActionsExample {

}
