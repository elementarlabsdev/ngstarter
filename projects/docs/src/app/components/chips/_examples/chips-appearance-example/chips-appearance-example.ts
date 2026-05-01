import { Component } from '@angular/core';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';

@Component({
  selector: 'app-chips-appearance-example',
  standalone: true,
  imports: [ChipSet, Chip],
  templateUrl: './chips-appearance-example.html',
  styleUrl: './chips-appearance-example.scss'
})
export class ChipsAppearanceExample {}
