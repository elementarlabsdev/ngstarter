import { Component } from '@angular/core';
import {
  ColorPicker,
  ColorPickerThumbnail,
  ColorPickerTriggerForDirective
} from '@ngstarter-ui/components/color-picker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker-with-popover-example',
  imports: [
    ColorPickerThumbnail,
    ColorPicker,
    ColorPickerTriggerForDirective,
    FormsModule
  ],
  templateUrl: './color-picker-with-popover-example.html',
  styleUrl: './color-picker-with-popover-example.scss'
})
export class ColorPickerWithPopoverExample {
  color = 'green';
}
