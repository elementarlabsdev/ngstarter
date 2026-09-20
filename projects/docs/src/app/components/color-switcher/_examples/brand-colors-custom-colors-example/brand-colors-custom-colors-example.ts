import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';

@Component({
  selector: 'app-brand-colors-custom-colors-example',
  imports: [
    ColorSwitcher
  ],
  templateUrl: './brand-colors-custom-colors-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './brand-colors-custom-colors-example.scss'
})
export class BrandColorsCustomColorsExample {
  colors = ['#EF5A6F', '#D4BDAC', '#536493'];
  selectedColor = '';

  onColorChange(color: string): void {
    this.selectedColor = color;
  }
}
