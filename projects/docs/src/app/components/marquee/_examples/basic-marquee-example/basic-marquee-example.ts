import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Marquee } from '@ngstarter-ui/components/marquee';

@Component({
  selector: 'app-basic-marquee-example',
  imports: [
    Marquee
  ],
  templateUrl: './basic-marquee-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-marquee-example.scss'
})
export class BasicMarqueeExample {

}
