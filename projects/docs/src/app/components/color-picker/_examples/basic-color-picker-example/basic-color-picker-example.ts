import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPicker, ColorPickerThumbnail } from '@ngstarter-ui/components/color-picker';

@Component({
  selector: 'app-basic-color-picker-example',
  imports: [
    FormsModule,
    ColorPicker,
    ColorPickerThumbnail
  ],
  templateUrl: './basic-color-picker-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-color-picker-example.scss'
})
export class BasicColorPickerExample {
  color = 'green';
}
