import { Component } from '@angular/core';
import { MchartPie } from '@ngstarter/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';
import { Button } from '@ngstarter/components/button';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mchart-pie-basic-example',
  imports: [
    MchartPie,
    ShuffleArrayPipe,
    Button,
    SlideToggle,
    FormsModule
  ],
  templateUrl: './mchart-pie-basic-example.html',
  styleUrl: './mchart-pie-basic-example.scss'
})
export class MchartPieBasicExample {
  data1 = [1, 2, 3];
  data2 = [5, 2, 3];
  data3 = [1, 2, 3, 4];
  data4 = [6, 2, 3, 8, 10];

  showDataAnimation = true;

  refreshData(): void {
    this.data1 = this._shuffleArray(this.data1);
    this.data2 = this._shuffleArray(this.data2);
    this.data3 = this._shuffleArray(this.data3);
    this.data4 = this._shuffleArray(this.data4);
  }

  private _shuffleArray(data: number[]): number[] {
    return [...data.sort(() => .5 - Math.random())];
  }
}
