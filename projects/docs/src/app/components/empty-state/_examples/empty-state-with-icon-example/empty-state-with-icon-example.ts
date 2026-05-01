import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter/components/empty-state';

@Component({
  selector: 'app-empty-state-with-icon-example',
  imports: [
    EmptyState,
    EmptyStateContent,
    Icon,
    EmptyStateIcon
  ],
  templateUrl: './empty-state-with-icon-example.html',
  styleUrl: './empty-state-with-icon-example.scss'
})
export class EmptyStateWithIconExample {

}
