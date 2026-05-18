import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it, beforeEach } from 'vitest';
import { FormField, Label } from '../../../form-field/public-api';
import { PhoneInput } from './phone-input';

@Component({
  standalone: true,
  imports: [FormField, Label, PhoneInput, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <ngs-form-field>
        <ngs-label>Phone</ngs-label>
        <ngs-phone-input formControlName="phone" />
      </ngs-form-field>
    </form>
  `,
})
class TestComponent {
  form = new FormGroup({
    phone: new FormControl<string | null>('+14155552671'),
  });
}

describe('PhoneInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  it('clears form field state when the external value becomes empty', async () => {
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const formField = host.querySelector('ngs-form-field') as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;
    const phoneInput = fixture.debugElement.query(By.directive(PhoneInput)).componentInstance as PhoneInput;

    expect(input.value).not.toBe('');

    fixture.componentInstance.form.controls.phone.setValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.value).toBe('');
    expect(phoneInput.empty).toBe(true);
    expect(phoneInput.shouldLabelFloat).toBe(false);
    expect(formField.classList.contains('ngs-form-field-empty')).toBe(true);
    expect(formField.classList.contains('ngs-form-field-should-float')).toBe(false);

    fixture.componentInstance.form.controls.phone.setValue('+14155552671');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).not.toBe('');

    fixture.componentInstance.form.controls.phone.setValue('');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.value).toBe('');
    expect(phoneInput.empty).toBe(true);
    expect(phoneInput.shouldLabelFloat).toBe(false);
    expect(formField.classList.contains('ngs-form-field-empty')).toBe(true);
    expect(formField.classList.contains('ngs-form-field-should-float')).toBe(false);
  });

  it('keeps incomplete phone numbers editable', async () => {
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.form.controls.phone.setValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;

    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.value).toBe('1');
    expect(fixture.componentInstance.form.controls.phone.value).toBe('1');

    input.value = '12';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.value).toBe('12');
    expect(fixture.componentInstance.form.controls.phone.value).toBe('12');
  });

  it('keeps an invalid edited phone number in the input', async () => {
    const fixture: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input') as HTMLInputElement;

    input.value = '41555526712';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.value).toBe('41555526712');
    expect(fixture.componentInstance.form.controls.phone.value).toBe('+141555526712');
    expect(fixture.componentInstance.form.controls.phone.hasError('invalidPhone')).toBe(true);
  });
});
