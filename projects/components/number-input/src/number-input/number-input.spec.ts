import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { FormField } from '../../../form-field/src/form-field/form-field';
import { NumberInput } from './number-input';

@Component({
  standalone: true,
  imports: [FormField, NumberInput],
  template: `
    <ngs-form-field>
      <ngs-number-input />
    </ngs-form-field>
    <button id="outside-button">Outside</button>
  `,
})
class TestComponent {}

function dispatchFocusEvent(
  target: Element,
  type: 'focusin' | 'focusout',
  relatedTarget: Element | null = null,
): void {
  const event = new FocusEvent(type, { bubbles: true });
  Object.defineProperty(event, 'relatedTarget', {
    configurable: true,
    value: relatedTarget,
  });

  target.dispatchEvent(event);
}

describe('NumberInput', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should clear form field focus after leaving a step control', () => {
    const host = fixture.nativeElement as HTMLElement;
    const formField = host.querySelector('ngs-form-field') as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;
    const increaseControl = host.querySelector('.control-increase') as HTMLButtonElement;
    const outsideButton = host.querySelector('#outside-button') as HTMLButtonElement;

    dispatchFocusEvent(input, 'focusin');
    fixture.detectChanges();
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(true);

    dispatchFocusEvent(input, 'focusout', increaseControl);
    dispatchFocusEvent(increaseControl, 'focusin', input);
    fixture.detectChanges();
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(true);

    dispatchFocusEvent(increaseControl, 'focusout', outsideButton);
    fixture.detectChanges();
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(false);
  });
});
