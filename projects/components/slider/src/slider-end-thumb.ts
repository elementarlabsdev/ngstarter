import { Directive, forwardRef } from '@angular/core';
import { SliderThumb } from './slider-thumb';

@Directive({
  selector: 'input[ngsSliderEndThumb]',
  providers: [
    {
      provide: SliderThumb,
      useExisting: forwardRef(() => SliderEndThumb),
    },
  ],
})
export class SliderEndThumb extends SliderThumb {
  override getId() {
    return 'end';
  }
}
