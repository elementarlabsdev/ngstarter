import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentConfig } from '../../models/form-config.model';

@Component({
  selector: 'ngs-image-content',
  exportAs: 'ngsImageContent',
  imports: [],
  templateUrl: './image-content.html',
  styleUrl: './image-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-image-content',
  }
})
export class ImageContent {
  config = input.required<ComponentConfig>();
}
