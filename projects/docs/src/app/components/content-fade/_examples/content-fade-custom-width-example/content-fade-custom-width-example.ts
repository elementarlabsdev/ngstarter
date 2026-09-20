import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContentFade } from '@ngstarter-ui/components/content-fade';

@Component({
  selector: 'app-content-fade-custom-width-example',
  imports: [
    ContentFade
  ],
  templateUrl: './content-fade-custom-width-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-fade-custom-width-example.scss'
})
export class ContentFadeCustomWidthExample {
}
