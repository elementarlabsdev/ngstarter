import { Component } from '@angular/core';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';
import { ResizableContainer } from '@ngstarter-ui/components/resizable-container';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';

@Component({
  selector: 'app-mchart-bar-responsive-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe,
    ResizableContainer
  ],
  templateUrl: './mchart-bar-responsive-example.html',
  styleUrl: './mchart-bar-responsive-example.scss'
})
export class MchartBarResponsiveExample {

}
