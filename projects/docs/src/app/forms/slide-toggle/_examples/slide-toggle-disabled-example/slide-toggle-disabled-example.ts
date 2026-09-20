import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';

@Component({
  selector: 'app-slide-toggle-disabled-example',
  standalone: true,
  imports: [
    SlideToggle
  ],
  templateUrl: './slide-toggle-disabled-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './slide-toggle-disabled-example.scss'
})
export class SlideToggleDisabledExample {
}
