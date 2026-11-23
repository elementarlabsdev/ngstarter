import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  model,
  input, output, signal, untracked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
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
  host: {
    '(focusout)': 'onFocusOut($event)',
    '[attr.aria-readonly]': 'readonly() || null',
    'class': 'ngs-color-picker',
    '[class.is-disabled]': 'disabled()',
    '[class.as-dropdown]': 'asDropdown()',
    '(contextmenu)': '_handleContextMenu($event)'
  }
})
export class ColorPicker implements FormValueControl<string | null> {
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly touch = output<void>();

  protected onFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

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
  protected alpha = signal(1);

  readonly value = model<string | null>(null);
  private lastColor?: string | null;
  private lastPreset?: string;

  constructor() {
    effect(() => {
      const value = this.value();
      const preset = this.color();
      untracked(() => {
        if (value !== this.lastColor || preset !== this.lastPreset) {
          this._setColor(value !== this.lastColor ? value ?? preset : preset);
          this.lastColor = value;
          this.lastPreset = preset;
        }
      });
    });
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
    if (this.disabled() || this.readonly()) {
      return;
    }
    this._colorFromHue.set(color);
    const hsv = this.tmpColor.toHsv();
    this.updateColor(new TinyColor({ ...hsv, h: color.toHsv().h, a: this.alpha() }));
  }

  protected onHexColorChange(color: string) {
    if (this.disabled() || this.readonly() || !color.startsWith('#')) {
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
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.tmpColor = color.clone();
    this._color.set(color.clone());
    this.alpha.set(color.getAlpha());
    this._setHexColor(color);
    this.rawColorChange.emit(color.clone());
    this.emitEvent(color);
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

    this.lastColor = format;
    this.value.set(format);
    this.colorChange.emit(format);
  }
}
