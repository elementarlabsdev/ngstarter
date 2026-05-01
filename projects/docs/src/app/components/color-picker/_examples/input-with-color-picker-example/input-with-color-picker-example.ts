import { Component } from '@angular/core';
import { FormField, Label, Suffix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { FormsModule } from '@angular/forms';
import {
  ColorPicker,
  ColorPickerThumbnail,
  ColorPickerTriggerForDirective
} from '@ngstarter/components/color-picker';

@Component({
  selector: 'app-input-with-color-picker-example',
  imports: [
    FormField,
    Input,
    Label,
    Suffix,
    FormsModule,
    ColorPickerTriggerForDirective,
    ColorPickerThumbnail,
    ColorPicker,
  ],
  templateUrl: './input-with-color-picker-example.html',
  styleUrl: './input-with-color-picker-example.scss'
})
export class InputWithColorPickerExample {
  color = '#526BD6';
}
