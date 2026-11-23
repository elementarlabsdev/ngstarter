import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounce, disabled, FormField, form, min } from '@angular/forms/signals';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from './number-input';

@Component({
  imports: [NumberInput, ReactiveFormsModule],
  template: '<form><ngs-number-input [formControl]="value" aria-label="Minute step" /></form>',
})
class Host {
  readonly value = new FormControl(5);
}

@Component({
  imports: [NumberInput, FormField],
  template: '<ngs-number-input [formField]="order.quantity" />',
})
class SignalHost {
  readonly model = signal<{ quantity: number | null }>({ quantity: 5 });
  readonly unavailable = signal(false);
  readonly order = form(this.model, path => {
    min(path.quantity, 2);
    disabled(path.quantity, () => this.unavailable());
    debounce(path.quantity, 'blur');
  });
}

describe('NumberInput native control states', () => {
  it('commits typed values on blur and follows Signal Forms constraints and reset', () => {
    const fixture = TestBed.createComponent(SignalHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('5');
    expect(input.min).toBe('2');

    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(host.model().quantity).toBe(5);
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(host.order.quantity().touched()).toBe(true);
    expect(host.model().quantity).toBe(1);
    expect(host.order.quantity().invalid()).toBe(true);

    host.order.quantity().reset(null);
    host.unavailable.set(true);
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(input.disabled).toBe(true);
    expect(host.order.quantity().touched()).toBe(false);
  });

  it('disables its native input through Angular forms and forwards its accessible name', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Minute step');
    fixture.componentInstance.value.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.value.enable();
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
  });

  it('keeps step buttons from submitting a parent form', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const submit = vi.fn((event: Event) => event.preventDefault());
    fixture.nativeElement.querySelector('form').addEventListener('submit', submit);
    const increase = fixture.nativeElement.querySelector('.control-increase') as HTMLButtonElement;
    expect(increase.type).toBe('button');
    increase.click();
    expect(fixture.componentInstance.value.value).toBe(6);
    expect(submit).not.toHaveBeenCalled();
  });

  it('applies readonly to the input and ignores direct mutations when readonly or disabled', () => {
    const fixture = TestBed.createComponent(NumberInput);
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').readOnly).toBe(true);
    const input = fixture.nativeElement.querySelector('input');
    fixture.componentInstance.increase(new MouseEvent('click'), input);
    fixture.componentInstance.decrease(new MouseEvent('click'), input);
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.value()).toBe(5);
    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.increase(new MouseEvent('click'), input);
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.value()).toBe(5);
  });
});
