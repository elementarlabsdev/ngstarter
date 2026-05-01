import { Component } from '@angular/core';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';

@Component({
  selector: 'app-basic-brand-colors-example',
  imports: [
    ColorSwitcher
  ],
  templateUrl: './basic-brand-colors-example.html',
  styleUrl: './basic-brand-colors-example.scss'
})
export class BasicBrandColorsExample {
  selectedColor = '#08b0fe';

  onColorChange(color: string): void {
    this.selectedColor = color;
  }
}
