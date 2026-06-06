import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
  imports: [FormField, Label, Input, ChipEdit, ChipGrid, ChipInput, ChipRemove, ChipRow],
  template: `
    <ngs-form-field>
      <ngs-label>Favorite Fruits</ngs-label>
      <ngs-chip-grid
        #chipGrid
        [id]="gridId()"
        placeholder="Add fruit"
        [required]="required()"
        [disabled]="disabled()"
      >
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
          [ngsChipInputSeparatorKeyCodes]="separatorKeysCodes()"
          [ngsChipInputAddOnBlur]="addOnBlur()"
          (chipInputTokenEnd)="add($event)"
        />
      </ngs-chip-grid>
    </ngs-form-field>
  `
})
class ChipGridFormFieldHost {
  readonly fruits = signal(['Lemon']);
  readonly gridId = signal('fruits-grid');
  readonly required = signal(false);
  readonly disabled = signal(false);
  readonly addOnBlur = signal(false);
  readonly separatorKeysCodes = signal<readonly number[] | ReadonlySet<number>>(new Set([ENTER]));

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

  function grid(): ChipGrid {
    return fixture.debugElement.query(By.directive(ChipGrid)).componentInstance as ChipGrid;
  }

  function gridElement(): HTMLElement {
    return fixture.nativeElement.querySelector('ngs-chip-grid') as HTMLElement;
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  it('keeps the parent form field single-line when it has no chips', () => {
    fixture.componentInstance.fruits.set([]);
    fixture.detectChanges();

    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;

    expect(formField.classList.contains('ngs-form-field-multiline')).toBe(false);
  });

  it('reflects id, required, placeholder, and disabled inputs', () => {
    fixture.componentInstance.required.set(true);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(gridElement().id).toBe('fruits-grid');
    expect(gridElement().getAttribute('aria-disabled')).toBe('true');
    expect(grid().required).toBe(true);
    expect(grid().placeholder).toBe('Add fruit');
    expect(grid().disabled).toBe(true);
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
    input().value = 'Apple';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(keydown, 'keyCode', { value: ENTER });
    input().dispatchEvent(keydown);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('ngs-chip-row');
    expect(chips.length).toBe(2);
    expect(input().value).toBe('');
  });

  it('supports array separator key codes', () => {
    fixture.componentInstance.separatorKeysCodes.set([ENTER]);
    fixture.detectChanges();

    input().value = 'Pear';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(keydown, 'keyCode', { value: ENTER });
    input().dispatchEvent(keydown);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ngs-chip-row').length).toBe(2);
  });

  it('does not emit chip input tokens for default-prevented keydown events', () => {
    input().value = 'Pear';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(keydown, 'keyCode', { value: ENTER });
    keydown.preventDefault();
    input().dispatchEvent(keydown);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ngs-chip-row').length).toBe(1);
    expect(input().value).toBe('Pear');
  });

  it('adds a chip on blur when configured', () => {
    fixture.componentInstance.addOnBlur.set(true);
    fixture.detectChanges();

    input().value = 'Orange';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    input().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('ngs-chip-row').length).toBe(2);
    expect(input().value).toBe('');
  });

  it('updates empty, focused, and floating label states from the chip input', () => {
    fixture.componentInstance.fruits.set([]);
    fixture.detectChanges();

    expect(grid().empty).toBe(true);
    expect(grid().shouldLabelFloat).toBe(false);

    input().dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(grid().focused).toBe(true);
    expect(grid().empty).toBe(false);
    expect(grid().shouldLabelFloat).toBe(true);

    input().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(grid().focused).toBe(false);
  });

  it('implements ControlValueAccessor value writing and change registration', () => {
    const changes: any[] = [];
    grid().registerOnChange((value: any[]) => changes.push(value));

    grid().writeValue(['Lemon']);
    expect(grid().value).toEqual(['Lemon']);

    grid().writeValue(null);
    expect(grid().value).toEqual([]);

    grid().value = ['Lime'];
    expect(changes).toEqual([['Lime']]);
  });

  it('updates disabled state from ControlValueAccessor', () => {
    grid().setDisabledState(true);
    fixture.detectChanges();

    expect(grid().disabled).toBe(true);
    expect(gridElement().getAttribute('aria-disabled')).toBe('true');
  });

  it('focuses the registered chip input unless disabled', () => {
    let focusCalls = 0;
    input().focus = () => {
      focusCalls += 1;
    };

    grid().focus();
    expect(focusCalls).toBe(1);

    grid().setDisabledState(true);
    grid().focus();
    expect(focusCalls).toBe(1);
  });
});
