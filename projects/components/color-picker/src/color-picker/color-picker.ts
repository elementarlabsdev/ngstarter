import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input, OnChanges,
  OnInit, output, signal, SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ColorPickerResultFormat } from '../properties';
import { Saturation } from '../saturation/saturation';
import { Hue } from '../hue/hue';
import { Alpha } from '../alpha/alpha';
import { TinyColor } from '@ctrl/tinycolor';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'ngs-color-picker',
  exportAs: 'ngsColorPicker',
  imports: [
    FormsModule,
    Alpha,
    Saturation,
    Hue,

    Icon,
    Button,
    FormField,
    Label,
    Input,
    IconButtonSuffix
  ],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPicker),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-color-picker',
    '[class.is-disabled]': '_disabled()',
    '[class.as-dropdown]': 'asDropdown()',
    '(contextmenu)': '_handleContextMenu($event)'
  }
})
export class ColorPicker implements OnInit, OnChanges, ControlValueAccessor {
  color = input<string>('');
  disabled = input(false, {
    transform: booleanAttribute
  });
  asDropdown = input(true, {
    transform: booleanAttribute
  });
  showOpacity = input(true, {
    transform: booleanAttribute
  });
  resultFormat = input<ColorPickerResultFormat>('rgb');

  readonly colorChange = output<string>();
  readonly rawColorChange = output<TinyColor>();

  private tmpColor = new TinyColor('red');
  protected hexColor = signal(this.tmpColor.toHexString());

  protected _color = signal<TinyColor>(new TinyColor('red'));
  protected _colorFromHue = signal<TinyColor | undefined | null>(null);
  protected _disabled = signal(false);
  protected alpha = signal(1);

  ngOnInit() {
    if (this.color()) {
      this._setColor(this.color());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['color'] && changes['color'].previousValue !== changes['color'].currentValue) {
      this._setColor(changes['color'].currentValue);
    }

    if (changes['disabled'] && changes['disabled'].previousValue !== changes['disabled'].currentValue) {
      this._disabled.set(coerceBooleanProperty(changes['disabled'].currentValue));
    }
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(color: string) {
    this._setColor(color);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: BooleanInput) {
    this._disabled.set(coerceBooleanProperty(isDisabled));
  }

  protected async copyToClipboard(event: MouseEvent, hexInput: HTMLInputElement) {
    event.preventDefault();
    event.stopPropagation();
    const color = new TinyColor(this.hexColor());

    if (color.isValid) {
      await navigator.clipboard.writeText(color.toHexString());
    }

    hexInput.blur();
  }

  protected onSaturationColorChange(tinyColor: TinyColor) {
    this.updateColor(tinyColor.clone().setAlpha(this.alpha()));
  }

  protected _handleContextMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  protected onAlphaChange(alpha: number) {
    this.updateColor(this.tmpColor.clone().setAlpha(alpha));
  }

  protected onHueColorChange(color: TinyColor) {
    if (this._disabled()) {
      return;
    }
    this._colorFromHue.set(color);
    const hsv = this.tmpColor.toHsv();
    this.updateColor(new TinyColor({ ...hsv, h: color.toHsv().h, a: this.alpha() }));
  }

  protected onHexColorChange(color: string) {
    if (this._disabled() || !color.startsWith('#')) {
      return;
    }

    if (color.length === 4 || color.length === 7) {
      const hexColor = new TinyColor(color);

      if (!hexColor.isValid) {
        return;
      }

      this._colorFromHue.set(null);
      this.updateColor(hexColor.setAlpha(this.alpha()));
    }
  }

  protected onHexColorBlur() {
    this.hexColor.set(this.tmpColor.toHexString());
    this.onTouched();
  }

  protected _setHexColor(tinyColor: TinyColor) {
    if (!tinyColor.isValid) {
      return;
    }

    const hexColor = new TinyColor(this.hexColor());

    if (hexColor.isValid && hexColor.equals(tinyColor)) {
      return;
    }

    this.hexColor.set(tinyColor.toHexString());
  }

  private _setColor(color: string) {
    if (!color) {
      color = 'red';
    }

    const newColor = new TinyColor(color);

    if (!newColor.isValid) {
      return;
    }

    this._colorFromHue.set(null);
    this._color.set(newColor);
    this.tmpColor = newColor.clone();
    this.alpha.set(newColor.getAlpha());
    this.hexColor.set(newColor.toHexString());
  }

  private updateColor(color: TinyColor) {
    if (this._disabled()) {
      return;
    }
    this.tmpColor = color.clone();
    this._color.set(color.clone());
    this.alpha.set(color.getAlpha());
    this._setHexColor(color);
    this.rawColorChange.emit(color.clone());
    this.emitEvent(color);
    this.onTouched();
  }

  private emitEvent(newColor: TinyColor) {
    let format = newColor.toRgbString();

    if (this.resultFormat() === 'hex') {
      format = newColor.toHexString();
    } else if (this.resultFormat() === 'hsl') {
      format = newColor.toHslString();
    } else if (this.resultFormat() === 'hsv') {
      format = newColor.toHsvString();
    }

    this.colorChange.emit(format);
    this.onChange(format);
  }
}
