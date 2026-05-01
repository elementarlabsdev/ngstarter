import { Component } from '@angular/core';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateImage,
} from '@ngstarter/components/empty-state';

@Component({
  selector: 'app-empty-state-with-image-example',
  imports: [
    EmptyState,
    EmptyStateContent,
    EmptyStateImage
  ],
  templateUrl: './empty-state-with-image-example.html',
  styleUrl: './empty-state-with-image-example.scss'
})
export class EmptyStateWithImageExample {

}
