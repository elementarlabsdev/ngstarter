import { Directive, forwardRef } from '@angular/core';
import { SliderThumb } from './slider-thumb';

@Directive({
  selector: 'input[ngsSliderStartThumb]',
  standalone: true,
  providers: [
    {
      provide: SliderThumb,
      useExisting: forwardRef(() => SliderStartThumb),
    },
  ],
})
export class SliderStartThumb extends SliderThumb {
  override getId() {
    return 'start';
  }
}
