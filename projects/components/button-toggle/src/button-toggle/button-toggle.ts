import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { ButtonToggleGroup } from '../button-toggle-group/button-toggle-group';
import {Ripple} from "@ngstarter-ui/components/core";

let nextId = 0;

@Component({
  selector: 'ngs-button-toggle',
  exportAs: 'ngsButtonToggle',
  imports: [
    Icon,
    Ripple
  ],
  templateUrl: './button-toggle.html',
  styleUrl: './button-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ngs-button-toggle-checked]': 'isChecked',
    '[class.ngs-button-toggle-disabled]': 'isDisabled',
    '[class.only-icon]': 'onlyIcon()',
    '[attr.id]': 'id()',
    'class': 'ngs-button-toggle',
  },
})
export class ButtonToggle implements OnInit {
  id = input<string>(`ngs-button-toggle-${nextId++}`);
  value = input<any>(undefined);
  name = input<string | undefined>(undefined);
  checked = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  onlyIcon = input(false, { transform: booleanAttribute });

  private _internalChecked = false;
  get isChecked(): boolean {
    return this.checked() || this._internalChecked;
  }
  _setChecked(value: boolean) {
    this._internalChecked = value;
    this._changeDetectorRef.markForCheck();
  }

  readonly change = output<any>();

  public buttonToggleGroup = inject(forwardRef(() => ButtonToggleGroup), { optional: true });
  private _changeDetectorRef = inject(ChangeDetectorRef);

  get isDisabled(): boolean {
    return this.disabled() || (this.buttonToggleGroup && this.buttonToggleGroup.disabled());
  }

  get _shouldShowSelectionIndicator(): boolean {
    if (!this.isChecked) {
      return false;
    }

    if (!this.buttonToggleGroup) {
      return false;
    }

    return !this.buttonToggleGroup.hideSelectionIndicator();
  }

  ngOnInit() {
    if (this.buttonToggleGroup && this.buttonToggleGroup.value() === this.value()) {
      this._setChecked(true);
    }
  }

  _onButtonClick() {
    if (this.buttonToggleGroup) {
      this.buttonToggleGroup._onButtonClick(this);
    } else {
      this._setChecked(!this.isChecked);
      this.change.emit({ source: this, value: this.value() });
    }
  }
}
