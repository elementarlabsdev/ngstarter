import { Component } from '@angular/core';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';

@Component({
  selector: 'app-brand-colors-disabled-example',
  imports: [
    ColorSwitcher
  ],
  templateUrl: './brand-colors-disabled-example.html',
  styleUrl: './brand-colors-disabled-example.scss'
})
export class BrandColorsDisabledExample {
  selectedColor = '#08b0fe';

  onColorChange(color: string): void {
    this.selectedColor = color;
  }
}
