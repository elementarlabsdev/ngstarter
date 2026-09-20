import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChipListbox, ChipOption } from '@ngstarter-ui/components/chips';

@Component({
  selector: 'app-stacked-chips-example',
  imports: [
    ChipOption,
    ChipListbox
  ],
  templateUrl: './stacked-chips-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stacked-chips-example.scss'
})
export class StackedChipsExample {
  readonly bestBoys: string[] = [
    'Samoyed', 'Akita Inu', 'Alaskan Malamute', 'Siberian Husky'
  ];
}
