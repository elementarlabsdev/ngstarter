import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ChipAvatar } from '../chip-avatar';
import { ChipControl } from '../chip-control';
import { ChipRemove } from '../chip-remove';
import { ChipShape } from '../chip-shape';
import { Chip } from './chip';

@Component({
  imports: [Chip, ChipAvatar, ChipControl, ChipRemove, ChipShape],
  template: `
    @if (visible()) {
      <ngs-chip
        [appearance]="appearance()"
        [disabled]="disabled()"
        [value]="value()"
        (removed)="removed.set([...removed(), $event.chip])"
        (destroyed)="destroyed.set([...destroyed(), $event.chip])"
      >
        <span ngsChipAvatar class="projected-avatar">A</span>
        <span ngsChipShape class="projected-shape">S</span>
        <span class="projected-label">Lemon</span>
        <button type="button" ngsChipControl class="projected-control">C</button>
        <button type="button" ngsChipRemove class="projected-remove">R</button>
      </ngs-chip>
    }
  `
})
class ChipHost {
  readonly visible = signal(true);
  readonly appearance = signal('outlined');
  readonly disabled = signal(false);
  readonly value = signal<any>({ id: 1 });
  readonly removed = signal<Chip[]>([]);
  readonly destroyed = signal<Chip[]>([]);
}

describe('Chip', () => {
  let fixture: ComponentFixture<ChipHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipHost]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipHost);
    fixture.detectChanges();
  });

  it('renders host classes, appearance, aria state, and projected content slots', () => {
    const chip = fixture.nativeElement.querySelector('ngs-chip') as HTMLElement;

    expect(chip.classList.contains('ngs-chip')).toBe(true);
    expect(chip.getAttribute('appearance')).toBe('outlined');
    expect(chip.getAttribute('aria-disabled')).toBe('false');
    expect(chip.querySelector('.avatar .projected-avatar')).toBeTruthy();
    expect(chip.querySelector('.shape .projected-shape')).toBeTruthy();
    expect(chip.querySelector('.ngs-chip-label .projected-label')?.textContent?.trim()).toBe('Lemon');
    expect(chip.querySelector('.controls .projected-control')).toBeTruthy();
    expect(chip.querySelector('.controls .projected-remove')).toBeTruthy();
  });

  it('exposes the input value through the component instance', () => {
    const chip = fixture.debugElement.children[0].componentInstance as Chip;

    expect(chip.value()).toEqual({ id: 1 });
  });

  it('emits removed when the remove control is clicked', () => {
    const button = fixture.nativeElement.querySelector('.projected-remove') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.removed().length).toBe(1);
  });

  it('does not emit removed while disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('ngs-chip') as HTMLElement;
    const button = fixture.nativeElement.querySelector('.projected-remove') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(chip.classList.contains('ngs-chip-disabled')).toBe(true);
    expect(chip.getAttribute('aria-disabled')).toBe('true');
    expect(fixture.componentInstance.removed().length).toBe(0);
  });

  it('emits destroyed when removed from the DOM', () => {
    fixture.componentInstance.visible.set(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.destroyed().length).toBe(1);
  });
});
