import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Inject,
  input,
  OnInit,
  Optional,
  output,
  booleanAttribute,
  model,
  computed
} from '@angular/core';
import { RadioGroup } from '../radio-group/radio-group';

let nextId = 0;

@Component({
  selector: 'ngs-radio-button',
  templateUrl: './radio-button.html',
  styleUrl: './radio-button.scss',
  host: {
    '[class.ngs-radio-button-checked]': 'checked()',
    '[class.ngs-radio-button-disabled]': 'disabled()',
    '[attr.id]': 'id()',
    'class': 'ngs-radio-button',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButton implements OnInit {
  id = input(`ngs-radio-button-${nextId++}`);
  value = input<any>();
  name = input<string>();
  checked = model(false);
  disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute
  });

  disabled = computed(() => {
    return this.disabledInput() || (this.radioGroup && this.radioGroup.disabled());
  });

  readonly change = output<any>();

  constructor(
    @Optional() @Inject(forwardRef(() => RadioGroup)) public radioGroup: RadioGroup,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.radioGroup && this.radioGroup.value() === this.value()) {
      this.checked.set(true);
    }
  }

  _onInputClick(event: Event) {
    event.stopPropagation();
    if (this.radioGroup) {
      this.radioGroup._onRadioClick(this);
    } else {
      this.checked.set(true);
      this.change.emit({ source: this, value: this.value() });
    }
  }

  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }
}
