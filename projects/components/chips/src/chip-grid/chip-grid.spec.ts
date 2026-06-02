import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ENTER } from '@angular/cdk/keycodes';
import { describe, expect, it, beforeEach } from 'vitest';

import { FormField } from '../../../form-field/src/form-field/form-field';
import { Label } from '../../../form-field/src/label/label';
import { Input } from '../../../input/src/input';
import { ChipEdit } from '../chip-edit';
import { ChipInput, ChipInputEvent } from '../chip-input';
import { ChipRemove } from '../chip-remove';
import { ChipRow } from '../chip-row/chip-row';
import { ChipGrid } from './chip-grid';

@Component({
  standalone: true,
  imports: [FormField, Label, Input, ChipEdit, ChipGrid, ChipInput, ChipRemove, ChipRow],
  template: `
    <ngs-form-field>
      <ngs-label>Favorite Fruits</ngs-label>
      <ngs-chip-grid #chipGrid>
        @for (fruit of fruits(); track fruit) {
          <ngs-chip-row editable>
            {{ fruit }}
            <button type="button" ngsChipEdit>E</button>
            <button type="button" ngsChipRemove>X</button>
          </ngs-chip-row>
        }

        <input
          ngsInput
          [ngsChipInputFor]="chipGrid"
          [ngsChipInputSeparatorKeyCodes]="separatorKeysCodes"
          (chipInputTokenEnd)="add($event)"
        />
      </ngs-chip-grid>
    </ngs-form-field>
  `
})
class ChipGridFormFieldHost {
  readonly fruits = signal(['Lemon']);
  readonly separatorKeysCodes = new Set([ENTER]);

  add(event: ChipInputEvent): void {
    const value = event.value.trim();

    if (value) {
      this.fruits.update(fruits => [...fruits, value]);
    }

    event.chipInput.clear();
  }
}

describe('ChipGrid', () => {
  let fixture: ComponentFixture<ChipGridFormFieldHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipGridFormFieldHost]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipGridFormFieldHost);
    fixture.detectChanges();
  });

  it('keeps the parent form field single-line when it has no chips', () => {
    fixture.componentInstance.fruits.set([]);
    fixture.detectChanges();

    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;

    expect(formField.classList.contains('ngs-form-field-multiline')).toBe(false);
  });

  it('marks the parent form field as multiline when it has chips', () => {
    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;

    expect(formField.classList.contains('ngs-form-field-multiline')).toBe(true);
  });

  it('sizes projected chip action buttons', () => {
    const removeButton = fixture.nativeElement.querySelector('button[ngsChipRemove]') as HTMLButtonElement;
    const styles = getComputedStyle(removeButton);

    expect(styles.display).toBe('flex');
    expect(styles.width).toBe('20px');
    expect(styles.height).toBe('20px');
    expect(styles.paddingTop).toBe('0px');
  });

  it('places the chip input on its own row', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const styles = getComputedStyle(input);

    expect(styles.flexBasis).toBe('100%');
    expect(styles.width).not.toBe('auto');
  });

  it('keeps the chip input text vertically aligned like a form field input', () => {
    fixture.componentInstance.fruits.set([]);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const styles = getComputedStyle(input);

    expect(parseFloat(styles.height)).toBeGreaterThan(0);
    expect(styles.minHeight).toBe(styles.height);
    expect(styles.boxSizing).toBe('border-box');
  });

  it('adds a chip from input separator keys', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'Apple';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const keydown = new KeyboardEvent('keydown', { bubbles: true });
    Object.defineProperty(keydown, 'keyCode', { value: ENTER });
    input.dispatchEvent(keydown);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('ngs-chip-row');
    expect(chips.length).toBe(2);
    expect(input.value).toBe('');
  });
});
