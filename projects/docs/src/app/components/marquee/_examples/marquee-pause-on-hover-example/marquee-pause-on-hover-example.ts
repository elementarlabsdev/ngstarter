import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Marquee } from '@ngstarter-ui/components/marquee';

@Component({
  selector: 'app-marquee-pause-on-hover-example',
  imports: [
    Marquee
  ],
  templateUrl: './marquee-pause-on-hover-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './marquee-pause-on-hover-example.scss'
})
export class MarqueePauseOnHoverExample {

}
