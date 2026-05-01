import { Component } from '@angular/core';
import { MchartBar } from '@ngstarter/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-bar-custom-radius-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-bar-custom-radius-example.html',
  styleUrl: './mchart-bar-custom-radius-example.scss'
})
export class MchartBarCustomRadiusExample {

}
