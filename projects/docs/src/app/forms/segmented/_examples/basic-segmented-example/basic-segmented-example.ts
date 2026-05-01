import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SegmentedButton, Segmented } from '@ngstarter-ui/components/segmented';

@Component({
  selector: 'app-basic-segmented-example',
  imports: [
    FormsModule,
    Segmented,
    SegmentedButton
  ],
  templateUrl: './basic-segmented-example.html',
  styleUrl: './basic-segmented-example.scss'
})
export class BasicSegmentedExample {
  period = 'monthly';
}
