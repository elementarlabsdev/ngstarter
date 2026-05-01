import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressBar } from '@ngstarter/components/progress-bar';

@Component({
  selector: 'app-buffer-progress-bar-example',
  imports: [
    ProgressBar,
    FormsModule
  ],
  templateUrl: './buffer-progress-bar-example.html',
  styleUrl: './buffer-progress-bar-example.scss'
})
export class BufferProgressBarExample {
  value = 40;
  bufferValue = 60;

  get ngModelBufferValue() {
    return this.bufferValue;
  }

  set ngModelBufferValue(v: number) {
    this.bufferValue = v;
  }
}
