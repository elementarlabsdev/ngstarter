import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ChipEdit } from '../chip-edit';
import { ChipRemove } from '../chip-remove';
import { ChipEditedEvent, ChipRow } from './chip-row';

@Component({
  imports: [ChipEdit, ChipRemove, ChipRow],
  template: `
    <ngs-chip-row
      [appearance]="appearance()"
      [disabled]="disabled()"
      [editable]="editable()"
      (edited)="edited.set([...edited(), $event])"
      (removed)="removed.set(removed() + 1)"
    >
      <span class="projected-label">{{ label() }}</span>
      <button type="button" ngsChipEdit class="edit-button">Edit</button>
      <button type="button" ngsChipRemove class="remove-button">Remove</button>
    </ngs-chip-row>
  `
})
class ChipRowHost {
  readonly appearance = signal('outlined');
  readonly disabled = signal(false);
  readonly editable = signal(true);
  readonly label = signal('Lemon');
  readonly edited = signal<ChipEditedEvent[]>([]);
  readonly removed = signal(0);
}

describe('ChipRow', () => {
  let fixture: ComponentFixture<ChipRowHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipRowHost]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipRowHost);
    fixture.detectChanges();
  });

  function row(): HTMLElement {
    return fixture.nativeElement.querySelector('ngs-chip-row') as HTMLElement;
  }

  function label(): HTMLElement {
    return fixture.nativeElement.querySelector('.ngs-chip-label') as HTMLElement;
  }

  function editButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.edit-button') as HTMLButtonElement;
  }

  it('renders as a row with editable and appearance classes', () => {
    expect(row().getAttribute('role')).toBe('row');
    expect(row().classList.contains('ngs-chip-row')).toBe(true);
    expect(row().classList.contains('ngs-chip-editable')).toBe(true);
    expect(row().classList.contains('ngs-chip-outlined')).toBe(true);
  });

  it('starts editing from the edit control', () => {
    editButton().click();
    fixture.detectChanges();

    expect(row().classList.contains('ngs-chip-editing')).toBe(true);
    expect(label().getAttribute('contenteditable')).toBe('true');
  });

  it('emits edited with trimmed text when Enter saves editing', () => {
    editButton().click();
    fixture.detectChanges();

    label().innerText = '  Lime  ';
    label().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    const events = fixture.componentInstance.edited();
    expect(events.length).toBe(1);
    expect(events[0].value).toBe('Lime');
    expect(row().classList.contains('ngs-chip-editing')).toBe(false);
  });

  it('emits edited with trimmed text when blur saves editing', () => {
    editButton().click();
    fixture.detectChanges();

    label().innerText = '  Orange  ';
    label().dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    const events = fixture.componentInstance.edited();
    expect(events.length).toBe(1);
    expect(events[0].value).toBe('Orange');
  });

  it('cancels editing with Escape without emitting', () => {
    editButton().click();
    fixture.detectChanges();

    label().innerText = 'Orange';
    label().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.edited().length).toBe(0);
    expect(row().classList.contains('ngs-chip-editing')).toBe(false);
  });

  it('emits removed through the remove control', () => {
    const removeButton = fixture.nativeElement.querySelector('.remove-button') as HTMLButtonElement;

    removeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.removed()).toBe(1);
  });

  it('does not edit or remove while disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    editButton().click();
    const removeButton = fixture.nativeElement.querySelector('.remove-button') as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(row().classList.contains('ngs-chip-disabled')).toBe(true);
    expect(row().classList.contains('ngs-chip-editing')).toBe(false);
    expect(fixture.componentInstance.removed()).toBe(0);
  });
});
