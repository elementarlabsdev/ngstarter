import '@angular/compiler';
import { Component, Type, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FormBuilderField, FormBuilderFieldDefinition } from '../types';
import { FormBuilderFieldHost } from './field-host';

@Component({
  template: '<span class="custom-field first-field">First</span>'
})
class FirstCustomField {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
  readonly readonly = input(false);
  readonly definition = input<FormBuilderFieldDefinition>();
}

@Component({
  template: '<span class="custom-field second-field">Second</span>'
})
class SecondCustomField {
  readonly field = input.required<FormBuilderField>();
  readonly control = input.required<FormControl>();
  readonly readonly = input(false);
  readonly definition = input<FormBuilderFieldDefinition>();
}

@Component({
  imports: [FormBuilderFieldHost],
  template: `
    <ngs-form-builder-field-host
      [field]="field()"
      [control]="control"
      [definitions]="definitions()"
    />
  `
})
class FieldHostTestComponent {
  readonly field = signal<FormBuilderField>({
    id: 'field-1',
    name: 'field',
    type: 'first',
    label: 'Field'
  });
  readonly control = new FormControl<any>('');
  readonly definitions = signal<FormBuilderFieldDefinition[]>([]);
}

describe('FormBuilderFieldHost', () => {
  let fixture: ComponentFixture<FieldHostTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldHostTestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldHostTestComponent);
  });

  it('ignores stale async custom renderers after the field changes', async () => {
    let resolveFirst: (component: Type<any>) => void = () => {};
    let resolveSecond: (component: Type<any>) => void = () => {};
    const firstRenderer = vi.fn(() => new Promise<Type<any>>(resolve => {
      resolveFirst = resolve;
    }));
    const secondRenderer = vi.fn(() => new Promise<Type<any>>(resolve => {
      resolveSecond = resolve;
    }));

    fixture.componentInstance.definitions.set([
      {
        type: 'first',
        label: 'First',
        renderer: firstRenderer
      },
      {
        type: 'second',
        label: 'Second',
        renderer: secondRenderer
      }
    ]);

    fixture.detectChanges();
    fixture.componentInstance.field.set({
      ...fixture.componentInstance.field(),
      type: 'second'
    });
    fixture.detectChanges();

    resolveSecond(SecondCustomField);
    await settleFixture(fixture);

    expect(firstRenderer).toHaveBeenCalledOnce();
    expect(secondRenderer).toHaveBeenCalledOnce();
    expect(customFields(fixture).length).toBe(1);
    expect(fixture.nativeElement.querySelector('.second-field')).toBeTruthy();

    resolveFirst(FirstCustomField);
    await settleFixture(fixture);

    expect(customFields(fixture).length).toBe(1);
    expect(fixture.nativeElement.querySelector('.second-field')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.first-field')).toBeFalsy();
  });

  it('switches the logo action between Upload and Remove', async () => {
    fixture.componentInstance.field.set({
      id: 'company-logo',
      name: 'company_logo',
      type: 'logo-upload',
      label: 'Company logo'
    });
    fixture.componentInstance.control.setValue(null);
    fixture.detectChanges();

    expect(logoActionText(fixture)).toBe('Upload');

    fixture.componentInstance.control.setValue({
      name: 'logo.svg',
      url: 'data:image/svg+xml;base64,PHN2Zy8+'
    });
    fixture.detectChanges();

    expect(logoActionText(fixture)).toBe('Remove');

    const removeButton: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.ngs-form-builder-logo-upload-actions button'
    );
    removeButton?.click();
    await settleFixture(fixture);

    expect(fixture.componentInstance.control.value).toBeNull();
    expect(logoActionText(fixture)).toBe('Upload');
  });
});

async function settleFixture<T>(fixture: ComponentFixture<T>): Promise<void> {
  await Promise.resolve();
  await fixture.whenStable();
  fixture.detectChanges();
}

function customFields<T>(fixture: ComponentFixture<T>): NodeListOf<HTMLElement> {
  return fixture.nativeElement.querySelectorAll('.custom-field');
}

function logoActionText<T>(fixture: ComponentFixture<T>): string {
  return fixture.nativeElement
    .querySelector('.ngs-form-builder-logo-upload-actions button')
    ?.textContent?.trim() ?? '';
}
