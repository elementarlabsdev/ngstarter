import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { PinInput } from './pin-input';

@Component({
  imports: [FormsModule, PinInput],
  template: '<ngs-pin-input [(ngModel)]="value" />',
})
class TemplateDrivenHost {
  readonly value = signal('');
}

@Component({
  imports: [ReactiveFormsModule, PinInput],
  template: '<ngs-pin-input [formControl]="code" />',
})
class ReactiveHost {
  readonly code = new FormControl('1234');
}

describe('PinInput forms initialization', () => {
  it('renders and stabilizes with the empty ngModel used by the docs examples', async () => {
    await TestBed.configureTestingModule({ imports: [TemplateDrivenHost] }).compileComponents();
    const fixture = TestBed.createComponent(TemplateDrivenHost);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(4);
  });

  it('renders an initial reactive form value', async () => {
    await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
    expect(inputs.map(input => input.value).join('')).toBe('1234');
  });
});
