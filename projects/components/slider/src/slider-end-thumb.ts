import { Directive, forwardRef } from '@angular/core';
import { SliderThumb } from './slider-thumb';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[ngsSliderEndThumb]',
  host: {
    'class': 'ngs-slider-input',
    '[class.ngs-slider-input-active]': '_slider._activeThumb() === this',
    'type': 'range',
    '[attr.min]': 'min',
    '[attr.max]': 'max',
    '[attr.step]': 'step',
    '[value]': 'value',
    '(input)': '_onInput($event)',
    '(change)': '_onChange($event)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
  },
  providers: [
    {
      provide: SliderThumb,
      useExisting: forwardRef(() => SliderEndThumb),
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderEndThumb),
      multi: true,
    },
  ],
})
export class SliderEndThumb extends SliderThumb {
  override getId() {
    return 'end';
  }
}
