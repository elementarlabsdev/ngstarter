import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, beforeEach } from 'vitest';

import { ChipOption } from '../chip-option/chip-option';
import { ChipListbox } from './chip-listbox';

@Component({
  imports: [ChipListbox, ChipOption, ReactiveFormsModule],
  template: `
    <ngs-chip-listbox [formControl]="control()" [multiple]="multiple()">
      @for (option of options(); track option.value) {
        <ngs-chip-option [value]="option.value" [disabled]="option.disabled ?? false">
          {{ option.label }}
        </ngs-chip-option>
      }
    </ngs-chip-listbox>
  `
})
class ChipListboxFormHost {
  readonly control = signal(new FormControl<string | string[] | null>('active'));
  readonly multiple = signal(false);
  readonly options = signal([
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive', disabled: true }
  ]);
}

@Component({
  imports: [ChipListbox, ChipOption],
  template: `
    <ngs-chip-listbox [multiple]="multiple()">
      <ngs-chip-option value="active" selected>Active</ngs-chip-option>
      <ngs-chip-option value="pending" selected>Pending</ngs-chip-option>
    </ngs-chip-listbox>
  `
})
class ChipListboxSelectedHost {
  readonly multiple = signal(false);
}

@Component({
  imports: [ChipListbox, ChipOption],
  template: `
    <ngs-chip-listbox [disabled]="disabled()">
      <ngs-chip-option value="active" selected>Active</ngs-chip-option>
      <ngs-chip-option value="pending">Pending</ngs-chip-option>
    </ngs-chip-listbox>
  `
})
class ChipListboxDisabledInputHost {
  readonly disabled = signal(false);
}

@Component({
  imports: [ChipListbox, ChipOption],
  template: `
    <ngs-chip-listbox>
      <ngs-chip-option>Nameless</ngs-chip-option>
    </ngs-chip-listbox>
  `
})
class ChipListboxImplicitValueHost {}

async function settleChipListbox(fixture: ComponentFixture<any>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve));
  fixture.detectChanges();
}

describe('ChipListbox', () => {
  let fixture: ComponentFixture<ChipListboxFormHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipListboxFormHost]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipListboxFormHost);
    fixture.detectChanges();
    await settleChipListbox(fixture);
  });

  function listbox(): HTMLElement {
    return fixture.nativeElement.querySelector('ngs-chip-listbox') as HTMLElement;
  }

  function chips(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('ngs-chip-option'));
  }

  it('sets listbox accessibility attributes', () => {
    expect(listbox().getAttribute('role')).toBe('listbox');
    expect(listbox().getAttribute('aria-multiselectable')).toBe('false');
    expect(listbox().getAttribute('aria-disabled')).toBe('false');
  });

  it('selects the option that matches a single FormControl value', () => {
    const [active, pending] = chips();

    expect(active.classList.contains('ngs-chip-selected')).toBe(true);
    expect(active.getAttribute('aria-selected')).toBe('true');
    expect(pending.classList.contains('ngs-chip-selected')).toBe(false);
  });

  it('updates a single FormControl value and deselects the previous option on click', () => {
    const [active, pending] = chips();

    pending.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toBe('pending');
    expect(active.classList.contains('ngs-chip-selected')).toBe(false);
    expect(pending.classList.contains('ngs-chip-selected')).toBe(true);
  });

  it('clears a single value when the selected option is toggled off', () => {
    chips()[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toBeNull();
    expect(chips()[0].classList.contains('ngs-chip-selected')).toBe(false);
  });

  it('does not select disabled options', () => {
    chips()[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toBe('active');
    expect(chips()[2].classList.contains('ngs-chip-selected')).toBe(false);
  });

  it('supports multiple FormControl values', async () => {
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.control.set(new FormControl<string[]>(['active']));
    fixture.detectChanges();
    await settleChipListbox(fixture);

    chips()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toEqual(['active', 'pending']);

    chips()[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toEqual(['pending']);
  });

  it('updates selected chips when the FormControl value changes programmatically', async () => {
    fixture.componentInstance.control().setValue('pending');
    fixture.detectChanges();
    await settleChipListbox(fixture);

    expect(chips()[0].classList.contains('ngs-chip-selected')).toBe(false);
    expect(chips()[1].classList.contains('ngs-chip-selected')).toBe(true);
  });

  it('ignores selection while disabled by input', async () => {
    const disabledFixture = TestBed.createComponent(ChipListboxDisabledInputHost);
    disabledFixture.detectChanges();
    await settleChipListbox(disabledFixture);
    disabledFixture.componentInstance.disabled.set(true);
    disabledFixture.detectChanges();

    const disabledListbox = disabledFixture.nativeElement.querySelector('ngs-chip-listbox') as HTMLElement;
    const disabledChips = Array.from(disabledFixture.nativeElement.querySelectorAll('ngs-chip-option')) as HTMLElement[];

    disabledChips[1].click();
    disabledFixture.detectChanges();

    expect(disabledListbox.getAttribute('aria-disabled')).toBe('true');
    expect(disabledChips[0].classList.contains('ngs-chip-selected')).toBe(true);
    expect(disabledChips[1].classList.contains('ngs-chip-selected')).toBe(false);
  });

  it('ignores selection while disabled by FormControl state', () => {
    fixture.componentInstance.control().disable();
    fixture.detectChanges();

    chips()[1].click();
    fixture.detectChanges();

    expect(listbox().getAttribute('aria-disabled')).toBe('true');
    expect(fixture.componentInstance.control().value).toBe('active');
  });

  it('subscribes to options added after content init', async () => {
    fixture.componentInstance.options.update(options => [
      ...options,
      { value: 'blocked', label: 'Blocked' }
    ]);
    fixture.detectChanges();
    await settleChipListbox(fixture);

    chips()[3].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control().value).toBe('blocked');
  });

  it('uses selected option inputs as the initial value when no value was written', async () => {
    const selectedFixture = TestBed.createComponent(ChipListboxSelectedHost);
    selectedFixture.detectChanges();
    await settleChipListbox(selectedFixture);

    const listboxInstance = selectedFixture.debugElement.query(By.directive(ChipListbox)).componentInstance as ChipListbox;
    expect(listboxInstance.value).toBe('pending');
  });

  it('uses all selected option inputs as the initial multiple value', async () => {
    const selectedFixture = TestBed.createComponent(ChipListboxSelectedHost);
    selectedFixture.componentInstance.multiple.set(true);
    selectedFixture.detectChanges();
    await settleChipListbox(selectedFixture);

    const listboxInstance = selectedFixture.debugElement.query(By.directive(ChipListbox)).componentInstance as ChipListbox;
    expect(listboxInstance.value).toEqual(['active', 'pending']);
  });

  it('falls back to option instances when no explicit value is provided', async () => {
    const implicitFixture = TestBed.createComponent(ChipListboxImplicitValueHost);
    implicitFixture.detectChanges();
    await settleChipListbox(implicitFixture);

    const listboxInstance = implicitFixture.debugElement.query(By.directive(ChipListbox)).componentInstance as ChipListbox;
    const optionInstance = implicitFixture.debugElement.query(By.directive(ChipOption)).componentInstance as ChipOption;

    listboxInstance.writeValue(optionInstance);
    implicitFixture.detectChanges();
    await settleChipListbox(implicitFixture);

    expect(optionInstance.isSelected).toBe(true);
  });
});
