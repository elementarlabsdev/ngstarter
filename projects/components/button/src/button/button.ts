import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { Ripple } from '@ngstarter-ui/components/core';

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'tonal' | '';

@Component({
  selector: `
    button[ngsButton], button[ngsIconButton],
    a[ngsButton], a[ngsIconButton]
  `,
  exportAs: 'ngsButton',
  imports: [
    Ripple
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    'class': 'ngs-button',
    '[attr.disabled]': '((disabled() || loading()) && !disabledInteractive()) || null',
    '[class.ngs-button-disabled]': 'disabled() || loading()',
    '[class.ngs-button-loading]': 'loading()',
    '[class.ngs-button-primary]': 'ngsButton() === "filled"',
    '[class.ngs-button-outlined]': 'ngsButton() === "outlined"',
    '[class.ngs-button-text]': '(ngsButton() === "text" || ngsButton() === "") && ngsIconButton() !== undefined',
    '[class.ngs-button-tonal]': 'ngsButton() === "tonal"',
    '[class.ngs-icon-button]': 'ngsIconButton() !== undefined',
    '[class.is-reverse]': 'reverse()',
    '[class.hide-text-on-mobile]': 'hideTextOnMobile()',
    '[class.is-full-width]': 'fullWidth()',
    '[attr.aria-disabled]': '(disabled() || loading()).toString()',
    '(click)': '_haltDisabledEvents($event)',
    '[attr.tabindex]': '(disabled() || loading()) && disabledInteractive() ? 0 : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly elementRef = inject(ElementRef);
  readonly _ripple = inject(Ripple, { optional: true });

  readonly ngsButton = input<ButtonVariant>('text');
  readonly ngsIconButton = input(undefined, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly disabledInteractive = input(false, { transform: booleanAttribute });
  readonly disableRipple = input(false, { transform: booleanAttribute });
  readonly reverse = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly hideTextOnMobile = input(false, { transform: booleanAttribute });

  constructor() {
    effect(() => {
      if (this._ripple) {
        this._ripple.disabled.set(this.disabled() || this.loading() || this.disableRipple());
        this._ripple.trigger.set(this.elementRef.nativeElement);
        this._ripple.centered.set(this.isIconButton);
      }
    });
  }

  /** Whether the button is an icon button. */
  get isIconButton(): boolean {
    return this.ngsIconButton() !== undefined;
  }

  _haltDisabledEvents(event: Event) {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
