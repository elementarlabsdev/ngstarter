import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';

@Component({
  selector: 'app-chips-with-icons-example',
  imports: [
    Chip,
    ChipSet
  ],
  templateUrl: './chips-with-icons-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chips-with-icons-example.scss'
})
export class ChipsWithIconsExample {

}
