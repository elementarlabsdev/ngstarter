import { Component } from '@angular/core';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter/components/empty-state';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-empty-state-with-custom-icon-example',
  imports: [
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    Icon
  ],
  templateUrl: './empty-state-with-custom-icon-example.html',
  styleUrl: './empty-state-with-custom-icon-example.scss'
})
export class EmptyStateWithCustomIconExample {

}
