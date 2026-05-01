import { Component } from '@angular/core';
import { ColorSwitcher } from '@ngstarter/components/color-switcher';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-colors-as-form-control-example',
  imports: [
    ColorSwitcher,
    FormsModule
  ],
  templateUrl: './brand-colors-as-form-control-example.html',
  styleUrl: './brand-colors-as-form-control-example.scss'
})
export class BrandColorsAsFormControlExample {
  selectedColor = '#4ed7ff';
}
