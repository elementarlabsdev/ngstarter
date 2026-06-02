import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { ChipAvatar } from '../chip-avatar';
import { ChipControl } from '../chip-control';
import { ChipShape } from '../chip-shape';
import { Chip } from '../chip/chip';
import { ChipSet } from './chip-set';

@Component({
  standalone: true,
  imports: [Chip, ChipAvatar, ChipControl, ChipSet, ChipShape],
  template: `
    <ngs-chip-set>
      <ngs-chip>
        <span ngsChipAvatar class="avatar-directive">A</span>
        <span ngsChipShape class="shape-directive">S</span>
        <span>Fruit</span>
        <button type="button" ngsChipControl class="control-directive">C</button>
      </ngs-chip>
    </ngs-chip-set>
  `
})
class ChipSetHost {}

describe('ChipSet', () => {
  let fixture: ComponentFixture<ChipSetHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipSetHost]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipSetHost);
    fixture.detectChanges();
  });

  it('renders as a presentation chip set', () => {
    const set = fixture.nativeElement.querySelector('ngs-chip-set') as HTMLElement;

    expect(set.classList.contains('ngs-chip-set')).toBe(true);
    expect(set.getAttribute('role')).toBe('presentation');
  });

  it('applies helper directive classes', () => {
    expect(fixture.nativeElement.querySelector('.avatar-directive')?.classList.contains('ngs-chip-avatar')).toBe(true);
    expect(fixture.nativeElement.querySelector('.shape-directive')?.classList.contains('ngs-chip-shape')).toBe(true);
    expect(fixture.nativeElement.querySelector('.control-directive')?.classList.contains('ngs-chip-control')).toBe(true);
  });
});
