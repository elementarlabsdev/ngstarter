export interface DigitRollerNumberPart {
  type: string;
  value: string;
  key: string;
  numericValue?: number;
}

export interface DigitRollerFormattedNumber {
  pre: DigitRollerNumberPart[];
  integer: DigitRollerNumberPart[];
  fraction: DigitRollerNumberPart[];
  post: DigitRollerNumberPart[];
}

export const DIGIT_ROLLER_EMPTY_FORMATTED: DigitRollerFormattedNumber = {
  pre: [],
  integer: [],
  fraction: [],
  post: [],
};

export type DigitRollerTrend = number | ((oldValue: number, value: number) => number);

export type DigitRollerTiming = Omit<KeyframeAnimationOptions, 'composite'>;

export type DigitRollerEasing = 'default' | 'spring' | 'overshoot' | (string & {});

export interface DigitRollerDigitConfig {
  max?: number;
}

export type DigitRollerDigits = Record<number, DigitRollerDigitConfig>;
