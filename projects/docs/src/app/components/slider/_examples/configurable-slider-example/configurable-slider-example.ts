import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Divider } from '@ngstarter-ui/components/divider';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-configurable-slider-example',
  imports: [
    FormsModule,
    Checkbox,
    Slider,
    SliderThumb,
    Label,
    Divider,
    Input,
    FormField
  ],
  templateUrl: './configurable-slider-example.html',
  styleUrl: './configurable-slider-example.scss'
})
export class ConfigurableSliderExample {
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
}
