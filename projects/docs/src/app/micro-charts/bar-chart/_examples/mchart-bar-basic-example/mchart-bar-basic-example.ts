import { Component } from '@angular/core';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-bar-basic-example',
  imports: [
      MchartBar,
      ShuffleArrayPipe
  ],
  templateUrl: './mchart-bar-basic-example.html',
  styleUrl: './mchart-bar-basic-example.scss'
})
export class MchartBarBasicExample {

}
