import {
  AfterContentChecked,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input, model,
  numberAttribute,
  OnChanges,
  OnInit, output,
  SimpleChanges
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Criteria } from '../enum';
import { RegExpValidator } from '../validator/regexp.class';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';

@Component({
  selector: 'ngs-password-strength',
  exportAs: 'ngsPasswordStrength',
  imports: [
    ProgressBar
  ],
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-password-strength',
    '[class.low]': 'isLow',
    '[class.weak]': 'isWeak',
    '[class.medium]': 'isMedium',
    '[class.strong]': 'isStrong',
    '[class.very-strong]': 'isVeryStrong',
  }
})
export class PasswordStrength implements OnInit, OnChanges, AfterContentChecked, FormValueControl<number> {
  password = input.required<any>();
  externalError = input(false, {
    transform: booleanAttribute
  });
  enableLengthRule = input(true, {
    transform: booleanAttribute
  });
  enableLowerCaseLetterRule = input(true, {
    transform: booleanAttribute
  });
  enableUpperCaseLetterRule = input(true, {
    transform: booleanAttribute
  });
  enableDigitRule = input(true, {
    transform: booleanAttribute
  });
  enableSpecialCharRule = input(true, {
    transform: booleanAttribute
  });
  min = input<number | undefined, unknown>(8, {
    transform: value => value == null ? 8 : numberAttribute(value)
  });
  max = input<number | undefined, unknown>(30, {
    transform: value => value == null ? 30 : numberAttribute(value)
  });
  customValidator = input<any>();
  warnThreshold = input(21, {
    transform: numberAttribute
  });
  accentThreshold = input(81, {
    transform: numberAttribute
  });

  readonly strengthChanged = output<number>();

  criteriaMap: Map<Criteria, RegExp> = new Map<Criteria, RegExp>();
  containAtLeastMinChars: boolean;
  containAtLeastOneLowerCaseLetter: boolean;
  containAtLeastOneUpperCaseLetter: boolean;
  containAtLeastOneDigit: boolean;
  containAtLeastOneSpecialChar: boolean;
  containAtCustomChars: boolean;

  readonly value = model(0);

  get strength(): number {
    return this.value() ?? 0;
  }

  get isLow(): boolean {
    return this.strength === 20;
  }

  get isWeak(): boolean {
    return this.strength === 40;
  }

  get isMedium(): boolean {
    return this.strength === 60;
  }

  get isStrong(): boolean {
    return this.strength === 80;
  }

  get isVeryStrong(): boolean {
    return this.strength === 100;
  }

  ngOnInit(): void {
    this.setRulesAndValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['externalError'] && changes['externalError'].firstChange) || (changes['password'] && changes['password'].firstChange)) {
      return;
    } else if (changes['externalError'] && changes['externalError'].currentValue) {
      // this._color = 'weak';
      return;
    } else if (changes['password'] && changes['password'].previousValue === changes['password'].currentValue && !changes['password'].firstChange) {
      this.calculatePasswordStrength();
    } else {
      this.password && this.password.length > 0 ?
        this.calculatePasswordStrength() : this.reset();
    }
  }

  setRulesAndValidators(): void {
    this.criteriaMap = new Map<Criteria, RegExp>();
    if (this.enableLengthRule()) {
      this.criteriaMap.set(Criteria.at_least_eight_chars, RegExp(`^.{${(this.min() ?? 8)},${(this.max() ?? 30)}}$`));
    }
    if (this.enableLowerCaseLetterRule()) {
      this.criteriaMap.set(Criteria.at_least_one_lower_case_char, RegExpValidator.lowerCase);
    }
    if (this.enableUpperCaseLetterRule()) {
      this.criteriaMap.set(Criteria.at_least_one_upper_case_char, RegExpValidator.upperCase);
    }
    if (this.enableDigitRule()) {
      this.criteriaMap.set(Criteria.at_least_one_digit_char, RegExpValidator.digit);
    }
    if (this.enableSpecialCharRule()) {
      this.criteriaMap.set(Criteria.at_least_one_special_char, RegExpValidator.specialChar);
    }
    if (this.customValidator()) {
      this.criteriaMap.set(Criteria.at_custom_chars, this.customValidator());
    }

  }

  calculatePasswordStrength(): void {
    const requirements: Array<boolean> = [];
    const unit = 100 / this.criteriaMap.size;
    requirements.push(
      this.enableLengthRule() ? this._containAtLeastMinChars() : false,
      this.enableLowerCaseLetterRule() ? this._containAtLeastOneLowerCaseLetter() : false,
      this.enableUpperCaseLetterRule() ? this._containAtLeastOneUpperCaseLetter() : false,
      this.enableDigitRule() ? this._containAtLeastOneDigit() : false,
      this.enableSpecialCharRule() ? this._containAtLeastOneSpecialChar() : false,
      this.customValidator() ? this._containCustomChars() : false
    );
    this.value.set(this.criteriaMap.size ? requirements.filter(Boolean).length * unit : 0);
    this.strengthChanged.emit(this.strength);
  }

  reset() {
    this.value.set(0);
    this.containAtLeastMinChars = false;
    this.containAtLeastOneLowerCaseLetter = false;
    this.containAtLeastOneUpperCaseLetter = false;
    this.containAtLeastOneDigit = false;
    this.containAtCustomChars = false;
    this.containAtLeastOneSpecialChar = false;
  }

  private _containAtLeastMinChars(): boolean {
    this.containAtLeastMinChars = this.password().length >= (this.min() ?? 8);
    return this.containAtLeastMinChars;
  }

  private _containAtLeastOneLowerCaseLetter(): boolean {
    // @ts-ignore
    this.containAtLeastOneLowerCaseLetter = this.criteriaMap
      .get(Criteria.at_least_one_lower_case_char)
      .test(this.password())
    ;
    return this.containAtLeastOneLowerCaseLetter;
  }

  private _containAtLeastOneUpperCaseLetter(): boolean {
    // @ts-ignore
    this.containAtLeastOneUpperCaseLetter = this.criteriaMap
      .get(Criteria.at_least_one_upper_case_char)
      .test(this.password())
    ;
    return this.containAtLeastOneUpperCaseLetter;
  }

  private _containAtLeastOneDigit(): boolean {
    // @ts-ignore
    this.containAtLeastOneDigit = this.criteriaMap
      .get(Criteria.at_least_one_digit_char)
      .test(this.password())
    ;
    return this.containAtLeastOneDigit;
  }

  private _containAtLeastOneSpecialChar(): boolean {
    // @ts-ignore
    this.containAtLeastOneSpecialChar = this.criteriaMap
      .get(Criteria.at_least_one_special_char)
      .test(this.password())
    ;
    return this.containAtLeastOneSpecialChar;
  }

  private _containCustomChars(): boolean {
    // @ts-ignore
    this.containAtCustomChars = this.criteriaMap
      .get(Criteria.at_custom_chars)
      .test(this.password())
    ;
    return this.containAtCustomChars;
  }

  ngAfterContentChecked(): void {
    if (this.password()) {
      this.calculatePasswordStrength();
    }
  }
}
