import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TextDivider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'app-text-divider-example',
  imports: [
    TextDivider
  ],
  templateUrl: './text-divider-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './text-divider-example.scss',
})
export class TextDividerExample {

}
