import {
  DigitRollerFormattedNumber,
  DigitRollerNumberPart,
} from './digit-roller.types';

const PRE_TYPES = new Set(['currency', 'literal', 'minusSign', 'plusSign', 'nan', 'infinity']);
const POST_TYPES = new Set(['percentSign', 'unit']);

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCachedFormatter(
  locales: string | string[] | undefined,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = JSON.stringify(locales) + ':' + JSON.stringify(options);
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locales, options);
    formatterCache.set(key, formatter);
  }

  return formatter;
}

export interface DigitRollerGlyph {
  value: number;
  glyph: string;
}

export function getDigitRollerGlyphs(
  locales?: string | string[],
  options: Intl.NumberFormatOptions = {},
): DigitRollerGlyph[] {
  const formatter = getCachedFormatter(locales, {
    numberingSystem: options.numberingSystem,
    useGrouping: false,
    maximumFractionDigits: 0,
  });

  return Array.from({ length: 10 }, (_, value) => ({
    value,
    glyph: formatter.format(value),
  }));
}

function getDigitValueMap(
  locales?: string | string[],
  options: Intl.NumberFormatOptions = {},
): Map<string, number> {
  return new Map(getDigitRollerGlyphs(locales, options).map(({ glyph, value }) => [glyph, value]));
}

export function formatDigitRollerValue(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locales?: string | string[],
  prefix = '',
  suffix = '',
): DigitRollerFormattedNumber {
  const formatter = getCachedFormatter(locales, options);
  const digitValues = getDigitValueMap(locales, options);
  const parts = formatter.formatToParts(value);

  const pre: DigitRollerNumberPart[] = [];
  const rawInteger: Intl.NumberFormatPart[] = [];
  const fraction: DigitRollerNumberPart[] = [];
  const post: DigitRollerNumberPart[] = [];

  let seenInteger = false;
  let seenDecimal = false;

  for (const part of parts) {
    if (part.type === 'integer' || part.type === 'group') {
      seenInteger = true;
      rawInteger.push(part);
    } else if (part.type === 'decimal' || part.type === 'fraction') {
      seenDecimal = true;
      fraction.push({ type: part.type, value: part.value, key: '' });
    } else if (!seenInteger && PRE_TYPES.has(part.type)) {
      pre.push({ type: part.type, value: part.value, key: `pre-${pre.length}` });
    } else if (seenInteger && POST_TYPES.has(part.type)) {
      post.push({ type: part.type, value: part.value, key: `post-${post.length}` });
    } else if (seenDecimal || seenInteger) {
      post.push({ type: part.type, value: part.value, key: `post-${post.length}` });
    } else {
      pre.push({ type: part.type, value: part.value, key: `pre-${pre.length}` });
    }
  }

  if (prefix) {
    pre.unshift({ type: 'prefix', value: prefix, key: '__prefix' });
  }

  if (suffix) {
    post.push({ type: 'suffix', value: suffix, key: '__suffix' });
  }

  const splitInteger: Intl.NumberFormatPart[] = [];
  for (const part of rawInteger) {
    if (part.type === 'integer') {
      for (const char of part.value) {
        splitInteger.push({ type: 'integer', value: char });
      }
    } else {
      splitInteger.push(part);
    }
  }

  let digitIndex = 0;
  const reversedInteger: DigitRollerNumberPart[] = [];
  for (let i = splitInteger.length - 1; i >= 0; i--) {
    const part = splitInteger[i];
    if (part.type === 'integer') {
      reversedInteger.push({
        type: 'integer',
        value: part.value,
        key: `i${digitIndex}`,
        numericValue: digitValues.get(part.value) ?? Number(part.value),
      });
      digitIndex++;
    } else {
      reversedInteger.push({ type: 'group', value: part.value, key: `g${digitIndex}` });
    }
  }

  let fractionDigitIndex = 0;
  const keyedFraction: DigitRollerNumberPart[] = [];
  for (const part of fraction) {
    if (part.type === 'fraction') {
      for (const char of part.value) {
        keyedFraction.push({
          type: 'fraction',
          value: char,
          key: `f${++fractionDigitIndex}`,
          numericValue: digitValues.get(char) ?? Number(char),
        });
      }
    } else {
      keyedFraction.push({ ...part, key: 'decimal' });
    }
  }

  return { pre, integer: reversedInteger.reverse(), fraction: keyedFraction, post };
}
