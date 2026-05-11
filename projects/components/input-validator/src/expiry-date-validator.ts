import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const onlyDigits = (value: unknown): string => {
  return String(value ?? '').replace(/\D/g, '');
};

const isValidLuhn = (value: string): boolean => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = value.length - 1; i >= 0; i--) {
    let digit = Number(value[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export function creditCardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = onlyDigits(control.value);

    if (!value) {
      return null;
    }

    if (value.length < 12 || value.length > 19 || !isValidLuhn(value)) {
      return { creditCardNumberInvalid: true };
    }

    return null;
  };
}

export function expiryDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = onlyDigits(control.value);

    if (!value) {
      return null;
    }

    if (value.length !== 4) {
      return { expiryDateInvalid: true };
    }

    const month = parseInt(value.substring(0, 2), 10);
    const year = parseInt(value.substring(2, 4), 10);

    if (month < 1 || month > 12) {
      return { expiryDateInvalid: true };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = parseInt(currentDate.getFullYear().toString().substring(2, 4));

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expiryDateInPast: true };
    }

    return null;
  };
}

export interface CreditCardCvvValidatorOptions {
  minLength?: number;
  maxLength?: number;
}

export function creditCardCvvValidator(options: CreditCardCvvValidatorOptions = {}): ValidatorFn {
  const minLength = options.minLength ?? 3;
  const maxLength = options.maxLength ?? 4;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = onlyDigits(control.value);

    if (!value) {
      return null;
    }

    if (value.length < minLength || value.length > maxLength) {
      return {
        creditCardCvvInvalid: {
          minLength,
          maxLength,
        },
      };
    }

    return null;
  };
}
