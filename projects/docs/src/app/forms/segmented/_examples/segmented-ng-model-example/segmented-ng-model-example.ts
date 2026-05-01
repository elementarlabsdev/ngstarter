import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-segmented-ng-model-example',
  standalone: true,
  imports: [
    FormsModule,
    Segmented,
    SegmentedButton,
    Button
  ],
  templateUrl: './segmented-ng-model-example.html',
  styleUrl: './segmented-ng-model-example.scss'
})
export class SegmentedNgModelExample {
  selectedPeriod = 'weekly';
}
