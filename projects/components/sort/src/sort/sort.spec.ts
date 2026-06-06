import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sort } from './sort-interface';
import { SortDirective } from './sort';
import { SortHeader } from './sort-header';

@Component({
  standalone: true,
  imports: [SortDirective, SortHeader],
  template: `
    <table
      ngsSort
      [ngsSortStart]="start()"
      [ngsSortDisableClear]="disableClear()"
      [ngsSortDisabled]="sortDisabled()"
      (ngsSortChange)="changes.push($event)"
    >
      <thead>
        <tr>
          <th
            ngs-sort-header="name"
            sortActionDescription="Sort by name"
            [disabled]="nameDisabled()"
          >
            Name
          </th>
          <th ngs-sort-header="weight" sortActionDescription="Sort by weight">Weight</th>
        </tr>
      </thead>
    </table>
  `,
})
class SortHost {
  readonly start = signal<Sort['direction']>('asc');
  readonly disableClear = signal(false);
  readonly sortDisabled = signal(false);
  readonly nameDisabled = signal(false);
  readonly changes: Sort[] = [];
}

@Component({
  standalone: true,
  imports: [SortHeader],
  template: `<button ngs-sort-header="name">Name</button>`,
})
class SortHeaderWithoutSortHost {}

describe('Sort', () => {
  let fixture: ComponentFixture<SortHost>;
  let host: SortHost;
  let sort: SortDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortHost],
    }).compileComponents();

    fixture = TestBed.createComponent(SortHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    sort = fixture.debugElement.query(By.directive(SortDirective)).injector.get(SortDirective);
  });

  it('should cycle a header through ascending, descending, and cleared states', () => {
    clickHeader('name');
    expect(sort.active()).toBe('name');
    expect(sort.direction()).toBe('asc');

    clickHeader('name');
    expect(sort.active()).toBe('name');
    expect(sort.direction()).toBe('desc');

    clickHeader('name');
    expect(sort.active()).toBe('name');
    expect(sort.direction()).toBe('');
    expect(host.changes).toEqual([
      { active: 'name', direction: 'asc' },
      { active: 'name', direction: 'desc' },
      { active: 'name', direction: '' },
    ]);
  });

  it('should use the configured start direction when a header first becomes active', () => {
    host.start.set('desc');
    fixture.detectChanges();

    clickHeader('weight');
    expect(sort.active()).toBe('weight');
    expect(sort.direction()).toBe('desc');
    expect(host.changes).toEqual([{ active: 'weight', direction: 'desc' }]);
  });

  it('should skip the cleared state when disableClear is enabled', () => {
    host.disableClear.set(true);
    fixture.detectChanges();

    clickHeader('name');
    clickHeader('name');
    clickHeader('name');

    expect(sort.direction()).toBe('asc');
    expect(host.changes).toEqual([
      { active: 'name', direction: 'asc' },
      { active: 'name', direction: 'desc' },
      { active: 'name', direction: 'asc' },
    ]);
  });

  it('should disable all headers when the sort directive is disabled', () => {
    host.sortDisabled.set(true);
    fixture.detectChanges();

    clickHeader('name');
    expect(sort.active()).toBe('');
    expect(sort.direction()).toBe('');
    expect(host.changes).toEqual([]);
    expect(headerElement('name').classList.contains('ngs-sort-header-disabled')).toBe(true);
  });

  it('should disable an individual header without disabling the whole sort', () => {
    host.nameDisabled.set(true);
    fixture.detectChanges();

    clickHeader('name');
    expect(sort.active()).toBe('');
    expect(host.changes).toEqual([]);
    expect(headerElement('name').classList.contains('ngs-sort-header-disabled')).toBe(true);

    clickHeader('weight');
    expect(sort.active()).toBe('weight');
    expect(sort.direction()).toBe('asc');
  });

  it('should update header classes for sorted and hint states', () => {
    const nameHeader = headerElement('name');
    const nameArrow = arrowElement('name');

    expect(nameArrow.classList.contains('ngs-sort-header-arrow-hint')).toBe(true);
    expect(nameArrow.classList.contains('ngs-sort-header-arrow-asc')).toBe(true);

    clickHeader('name');
    expect(nameHeader.querySelector('.ngs-sort-header-container')?.classList.contains('ngs-sort-header-sorted')).toBe(true);
    expect(nameArrow.classList.contains('ngs-sort-header-arrow-hint')).toBe(false);
    expect(nameArrow.classList.contains('ngs-sort-header-arrow-asc')).toBe(true);

    clickHeader('name');
    expect(nameArrow.classList.contains('ngs-sort-header-arrow-desc')).toBe(true);
  });

  it('should not throw when a sort header is used without a parent sort directive', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [SortHeaderWithoutSortHost],
      })
      .compileComponents();

    const standaloneFixture = TestBed.createComponent(SortHeaderWithoutSortHost);
    standaloneFixture.detectChanges();

    const button = standaloneFixture.nativeElement.querySelector('.ngs-sort-header-button') as HTMLElement;
    expect(() => button.click()).not.toThrow();
  });

  function clickHeader(id: string): void {
    const button = headerElement(id).querySelector('.ngs-sort-header-button') as HTMLElement;
    button.click();
    fixture.detectChanges();
  }

  function headerElement(id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[ngs-sort-header="${id}"]`) as HTMLElement;
  }

  function arrowElement(id: string): HTMLElement {
    return headerElement(id).querySelector('.ngs-sort-header-arrow') as HTMLElement;
  }
});
