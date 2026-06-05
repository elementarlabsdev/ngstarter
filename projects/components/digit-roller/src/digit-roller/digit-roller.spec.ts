import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { DigitRoller } from './digit-roller';

@Component({
  standalone: true,
  imports: [DigitRoller],
  template: `
    <ngs-digit-roller
      [value]="value()"
      [format]="format()"
      [locales]="locales()"
      [prefix]="prefix()"
      [suffix]="suffix()"
      [animated]="animated()"
    />
  `,
})
class DigitRollerHost {
  value = signal(1234);
  format = signal<Intl.NumberFormatOptions>({});
  locales = signal<string | string[] | undefined>('en-US');
  prefix = signal('');
  suffix = signal('');
  animated = signal(true);
}

type DigitRollerHostState = {
  value: number;
  format: Intl.NumberFormatOptions;
  locales: string | string[] | undefined;
  prefix: string;
  suffix: string;
  animated: boolean;
};

describe('DigitRoller', () => {
  it('renders formatted value for assistive technology and hides animated number columns', async () => {
    const fixture = await createFixture();
    const host = rollerHost(fixture);

    expect(host.classList.contains('ngs-digit-roller')).toBe(true);
    expect(host.getAttribute('data-animated')).toBe('true');
    expect(visualNumber(fixture).getAttribute('aria-hidden')).toBe('true');
    expect(srText(fixture)).toBe('1,234');
    expect(integerDigitValues(fixture)).toEqual(['1', '2', '3', '4']);
    expect(integerSeparatorValues(fixture)).toEqual([',']);
  });

  it('renders prefix and suffix as literal parts without changing the formatted plain text', async () => {
    const fixture = await createFixture({
      prefix: '$',
      suffix: ' USD',
    });

    expect(sectionLiteralValues(fixture, 'pre')).toEqual(['$']);
    expect(sectionLiteralValues(fixture, 'post')).toEqual([' USD']);
    expect(srText(fixture)).toBe('1,234');
  });

  it('respects locale and number format options for grouping and fractions', async () => {
    const fixture = await createFixture({
      value: 1234.5,
      locales: 'de-DE',
      format: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    });

    expect(srText(fixture)).toBe('1.234,50');
    expect(integerDigitValues(fixture)).toEqual(['1', '2', '3', '4']);
    expect(fractionDigitValues(fixture)).toEqual(['5', '0']);
    expect(integerSeparatorValues(fixture)).toEqual(['.']);
    expect(fractionSeparatorValues(fixture)).toEqual([',']);
  });

  it('updates rendered digit columns when the value changes', async () => {
    const fixture = await createFixture({ animated: false });

    fixture.componentInstance.value.set(9876);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(srText(fixture)).toBe('9,876');
    expect(integerDigitValues(fixture)).toEqual(['9', '8', '7', '6']);
  });

  it('reflects disabled animation state on the host', async () => {
    const fixture = await createFixture({ animated: false });

    expect(rollerHost(fixture).getAttribute('data-animated')).toBe('false');
    expect(srText(fixture)).toBe('1,234');
  });
});

async function createFixture(
  initialState: Partial<DigitRollerHostState> = {}
): Promise<ComponentFixture<DigitRollerHost>> {
  await TestBed.configureTestingModule({
    imports: [DigitRollerHost],
  }).compileComponents();

  const fixture = TestBed.createComponent(DigitRollerHost);
  if ('value' in initialState) {
    fixture.componentInstance.value.set(initialState.value as number);
  }
  if ('format' in initialState) {
    fixture.componentInstance.format.set(initialState.format as Intl.NumberFormatOptions);
  }
  if ('locales' in initialState) {
    fixture.componentInstance.locales.set(initialState.locales);
  }
  if ('prefix' in initialState) {
    fixture.componentInstance.prefix.set(initialState.prefix as string);
  }
  if ('suffix' in initialState) {
    fixture.componentInstance.suffix.set(initialState.suffix as string);
  }
  if ('animated' in initialState) {
    fixture.componentInstance.animated.set(initialState.animated as boolean);
  }
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

function rollerHost(fixture: ComponentFixture<DigitRollerHost>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-digit-roller') as HTMLElement;
}

function visualNumber(fixture: ComponentFixture<DigitRollerHost>): HTMLElement {
  return rollerHost(fixture).querySelector('.ngs-digit-roller__number') as HTMLElement;
}

function srText(fixture: ComponentFixture<DigitRollerHost>): string {
  return (rollerHost(fixture).querySelector('.ngs-digit-roller__sr-only')?.textContent ?? '').trim();
}

function integerDigitValues(fixture: ComponentFixture<DigitRollerHost>): string[] {
  return digitValues(fixture, 'integer');
}

function fractionDigitValues(fixture: ComponentFixture<DigitRollerHost>): string[] {
  return digitValues(fixture, 'fraction');
}

function digitValues(fixture: ComponentFixture<DigitRollerHost>, section: string): string[] {
  return querySection(fixture, section, '.ngs-digit-roller__digit').map((digit) =>
    digit.style.getPropertyValue('--_ngs-digit-roller-current').trim()
  );
}

function integerSeparatorValues(fixture: ComponentFixture<DigitRollerHost>): string[] {
  return separatorValues(fixture, 'integer');
}

function fractionSeparatorValues(fixture: ComponentFixture<DigitRollerHost>): string[] {
  return separatorValues(fixture, 'fraction');
}

function separatorValues(fixture: ComponentFixture<DigitRollerHost>, section: string): string[] {
  return querySection(fixture, section, '.ngs-digit-roller__separator').map((separator) => separator.textContent ?? '');
}

function sectionLiteralValues(fixture: ComponentFixture<DigitRollerHost>, section: string): string[] {
  return querySection(fixture, section, '.ngs-digit-roller__literal').map((literal) => literal.textContent ?? '');
}

function querySection(fixture: ComponentFixture<DigitRollerHost>, section: string, selector: string): HTMLElement[] {
  const sectionElement = rollerHost(fixture).querySelector(`.ngs-digit-roller__section--${section}`) as HTMLElement;

  return Array.from(sectionElement?.querySelectorAll(selector) ?? []) as HTMLElement[];
}
