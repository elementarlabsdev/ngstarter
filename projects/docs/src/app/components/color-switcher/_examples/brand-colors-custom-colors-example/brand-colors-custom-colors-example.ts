import { Component } from '@angular/core';
import { ColorSwitcher } from '@ngstarter/components/color-switcher';

@Component({
  selector: 'app-brand-colors-custom-colors-example',
  imports: [
    ColorSwitcher
  ],
  templateUrl: './brand-colors-custom-colors-example.html',
  styleUrl: './brand-colors-custom-colors-example.scss'
})
export class BrandColorsCustomColorsExample {
  colors = ['#EF5A6F', '#D4BDAC', '#536493'];
  selectedColor = '';

  onColorChange(color: string): void {
    this.selectedColor = color;
  }
}
