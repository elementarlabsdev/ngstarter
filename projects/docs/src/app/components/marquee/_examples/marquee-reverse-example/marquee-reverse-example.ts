import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Marquee } from '@ngstarter-ui/components/marquee';

@Component({
  selector: 'app-marquee-reverse-example',
  imports: [
    Marquee
  ],
  templateUrl: './marquee-reverse-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './marquee-reverse-example.scss'
})
export class MarqueeReverseExample {

}
