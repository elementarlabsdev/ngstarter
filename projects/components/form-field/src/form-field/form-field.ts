import {
  booleanAttribute,
  Component,
  contentChild,
  contentChildren,
  ElementRef,
  inject,
  input,
  viewChild,
  computed,
} from '@angular/core';
import { FormFieldControl } from '../form-field-control';
import { Label } from '../label/label';
import { FORM_FIELD } from '../form-field-token';
import { Prefix, Suffix, TextPrefix, TextSuffix, IconPrefix, IconButtonPrefix, IconSuffix, IconButtonSuffix } from '../prefix-suffix/prefix-suffix';
import { Hint } from '../hint/hint';
import { Error } from '../error/error';

@Component({
  selector: 'ngs-form-field',
  exportAs: 'ngsFormField',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  imports: [],
  providers: [
    {
      provide: FORM_FIELD,
      useExisting: FormField
    }
  ],
  host: {
    'class': 'ngs-form-field',
    '[class.ngs-form-field-disabled]': 'control()?.disabled',
    '[class.ngs-form-field-invalid]': 'control()?.errorState',
    '[class.ngs-form-field-should-float]': 'shouldLabelFloat()',
    '[class.ngs-form-field-has-label]': 'labelChild()',
    '[class.ngs-form-field-empty]': 'control()?.empty',
    '[class.ngs-form-field-focused]': 'control()?.focused',
    '[class.ngs-form-field-multiline]': 'control()?.multiline',
    '[class.ngs-form-field-subscript-hidden-if-empty]': 'subscriptHiddenIfEmpty()',
    '[class.ngs-form-field-has-icon-prefix]': 'iconPrefixChildren().length > 0',
    '[class.ngs-form-field-has-icon-button-prefix]': 'iconButtonPrefixChildren().length > 0',
    '[class.ngs-form-field-has-icon-suffix]': 'iconSuffixChildren().length > 0',
    '[class.ngs-form-field-has-icon-button-suffix]': 'iconButtonSuffixChildren().length > 0',
    '[class.same-height-as-button]': 'sameHeightAsButton()',
    '(click)': '_onClick($event)'
  }
})
export class FormField {
  readonly elementRef = inject(ElementRef);

  subscriptHiddenIfEmpty = input(false, {
    transform: booleanAttribute
  });
  sameHeightAsButton = input(false, {
    transform: booleanAttribute
  });
  wrapper = viewChild.required<ElementRef>('wrapper');
  container = viewChild.required<ElementRef>('container');
  control = contentChild(FormFieldControl);
  labelChild = contentChild(Label);
  prefixChildren = contentChildren(Prefix);
  iconPrefixChildren = contentChildren(IconPrefix);
  iconButtonPrefixChildren = contentChildren(IconButtonPrefix);
  textPrefixChildren = contentChildren(TextPrefix);
  suffixChildren = contentChildren(Suffix);
  iconSuffixChildren = contentChildren(IconSuffix);
  iconButtonSuffixChildren = contentChildren(IconButtonSuffix);
  textSuffixChildren = contentChildren(TextSuffix);
  hintChildren = contentChildren(Hint);
  errorChildren = contentChildren(Error);
  isRequired = computed(() => {
    const control = this.control();
    if (!control) {
      return false;
    }

    if (control.required) {
      return true;
    }

    const ngControl = control.ngControl;
    if (ngControl && ngControl.control && ngControl.control.validator) {
      const validator = ngControl.control.validator({} as any);
      if (validator && validator['required']) {
        return true;
      }
    }

    return false;
  });

  shouldLabelFloat(): boolean {
    return !!this.control()?.shouldLabelFloat;
  }

  protected _onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const wrapper = this.wrapper().nativeElement;
    const isInsideWrapper = wrapper.contains(target);

    if (!isInsideWrapper) {
      return;
    }

    const isIconButton = !!target.closest('.ngs-icon-button') || !!target.closest('[ngsIconButton]');
    const isToggle = !!target.closest('ngs-datepicker-toggle') || !!target.closest('ngs-date-range-picker');

    if (this.control()?.focused || isIconButton || isToggle) {
      return;
    }

    this.focus();
    event.stopPropagation();
  }

  focus(): void {
    const control = this.control();
    if (control && !control.disabled) {
      control.focus();
    }
  }
}
