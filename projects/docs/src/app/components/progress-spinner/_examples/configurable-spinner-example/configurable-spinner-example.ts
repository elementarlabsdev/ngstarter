import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';
import { ProgressSpinner } from '@ngstarter-ui/components/spinner';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'app-configurable-spinner-example',
  imports: [
    FormsModule,
    Slider,
    SliderThumb,
    ProgressSpinner,
    RadioButton,
    RadioGroup,
    Divider
  ],
  templateUrl: './configurable-spinner-example.html',
  styleUrl: './configurable-spinner-example.scss'
})
export class ConfigurableSpinnerExample {
  color: any = 'primary';
  mode: any = 'determinate';
  value = 50;
}
