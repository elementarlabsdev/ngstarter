import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from './number-input';

@Component({
  imports: [NumberInput, ReactiveFormsModule],
  template: '<form><ngs-number-input [formControl]="value" aria-label="Minute step" /></form>',
})
class Host {
  readonly value = new FormControl(5);
}

describe('NumberInput native control states', () => {
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
    fixture.componentInstance.writeValue(5);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').readOnly).toBe(true);
    const input = fixture.nativeElement.querySelector('input');
    fixture.componentInstance.increase(new MouseEvent('click'), input);
    fixture.componentInstance.decrease(new MouseEvent('click'), input);
    fixture.componentInstance.inputChange({ target: { value: '20' } });
    expect(fixture.componentInstance.value).toBe(5);
    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.increase(new MouseEvent('click'), input);
    fixture.componentInstance.inputChange({ target: { value: '20' } });
    expect(fixture.componentInstance.value).toBe(5);
  });
});
