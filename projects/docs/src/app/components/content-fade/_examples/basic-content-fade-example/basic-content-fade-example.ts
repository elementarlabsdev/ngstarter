import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContentFade } from '@ngstarter-ui/components/content-fade';

@Component({
  selector: 'app-basic-content-fade-example',
  imports: [
    ContentFade
  ],
  templateUrl: './basic-content-fade-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-content-fade-example.scss'
})
export class BasicContentFadeExample {

}
