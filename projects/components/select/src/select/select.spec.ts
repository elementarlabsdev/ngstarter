import '@angular/compiler';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { FormField } from '../../../form-field/src/form-field/form-field';
import { Option } from '../../../option/src/option/option';
import { Optgroup } from '../../../option/src/option/optgroup';
import { FilterTrigger } from '../filter-trigger/filter-trigger';
import { FilterTriggerValueDirective } from '../filter-trigger/filter-trigger-value.directive';
import { SelectBody } from '../select-body/select-body';
import { SelectFooter } from '../select-footer/select-footer';
import { SelectHeader } from '../select-header/select-header';
import { SelectTrigger } from '../select-trigger/select-trigger';
import { Select, SelectChange } from './select';
import { SelectDataSource, SelectDataSourceRequest } from './select-data-source';
import { SelectOptionContentDef } from './select-option-content-def.directive';
import { SelectValueDef } from './select-value-def.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option],
  template: `
    <ngs-select
      id="status-select"
      aria-label="Status"
      placeholder="Choose status"
      required
      [tabIndex]="5"
      [formControl]="status()"
      (opened)="opened.set(opened() + 1)"
      (closed)="closed.set(closed() + 1)"
      (selectionChange)="changes.set([...changes(), $event])">
      @for (option of options(); track option.value) {
        <ngs-option [value]="option.value" [disabled]="option.disabled ?? false">
          {{ option.label }}
        </ngs-option>
      }
    </ngs-select>
  `
})
class SingleSelectHost {
  readonly status = signal(new FormControl<string | null>(null, Validators.required));
  readonly options = signal([
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'blocked', label: 'Blocked', disabled: true },
    { value: null, label: 'Any status' }
  ]);
  readonly opened = signal(0);
  readonly closed = signal(0);
  readonly changes = signal<SelectChange[]>([]);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option],
  template: `
    <ngs-select [formControl]="teams()" multiple aria-label="Teams">
      @for (team of teamOptions(); track team) {
        <ngs-option [value]="team">{{ team }}</ngs-option>
      }
    </ngs-select>
  `
})
class MultipleSelectHost {
  readonly teams = signal(new FormControl<string[]>(['Design', 'Support']));
  readonly teamOptions = signal(['Design', 'Engineering', 'Product', 'Support']);
}

@Component({
  imports: [Select, Option, Optgroup],
  template: `
    <ngs-select aria-label="Available options">
      <ngs-optgroup label="Unavailable" disabled>
        <ngs-option value="disabled">Disabled group option</ngs-option>
      </ngs-optgroup>
      <ngs-option value="hidden" hidden>Hidden option</ngs-option>
      <ngs-option value="visible">Visible option</ngs-option>
    </ngs-select>
  `,
})
class UnavailableOptionsHost {}

@Component({
  imports: [Select, Option, FilterTrigger, FormField, ReactiveFormsModule],
  template: `
    <button class="before">Before</button>
    <ngs-form-field>
      <ngs-select class="ordinary" aria-label="Ordinary select" placeholder="Choose a value">
        <ngs-option value="active">Active</ngs-option>
      </ngs-select>
    </ngs-form-field>
    <ngs-select disabled aria-label="Disabled select">
      <ngs-option value="disabled">Disabled</ngs-option>
    </ngs-select>
    <ngs-select class="filter" aria-label="Status filter" [formControl]="status">
      <ngs-filter-trigger>Status</ngs-filter-trigger>
      <ngs-option value="active">Active</ngs-option>
      <ngs-option value="pending">Pending</ngs-option>
    </ngs-select>
    <button class="after">After</button>
  `,
})
class KeyboardFocusHost {
  readonly status = new FormControl<string | null>(null);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option],
  template: `
    <ngs-select
      [formControl]="status()"
      clearable
      aria-label="Clearable status"
      (selectionChange)="changes.set([...changes(), $event])">
      <ngs-option value="active">Active</ngs-option>
      <ngs-option value="pending">Pending</ngs-option>
    </ngs-select>
  `
})
class ClearableSingleSelectHost {
  readonly status = signal(new FormControl<string | null>('active'));
  readonly changes = signal<SelectChange[]>([]);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option],
  template: `
    <ngs-select
      [formControl]="teams()"
      multiple
      clearable
      aria-label="Clearable teams"
      (selectionChange)="changes.set([...changes(), $event])">
      @for (team of teamOptions(); track team) {
        <ngs-option [value]="team">{{ team }}</ngs-option>
      }
    </ngs-select>
  `
})
class ClearableMultipleSelectHost {
  readonly teams = signal(new FormControl<string[]>(['Design', 'Support']));
  readonly teamOptions = signal(['Design', 'Engineering', 'Product', 'Support']);
  readonly changes = signal<SelectChange[]>([]);
}

@Component({
  standalone: true,
  imports: [Select, Option],
  template: `
    <ngs-select [disabled]="disabled()" aria-label="Disabled input">
      <ngs-option value="active">Active</ngs-option>
    </ngs-select>
  `
})
class DisabledInputHost {
  readonly disabled = signal(true);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option, SelectTrigger],
  template: `
    <ngs-select [formControl]="status()" placeholder="Native placeholder" aria-label="Custom trigger">
      <ngs-select-trigger>
        <span class="custom-trigger">Custom status trigger</span>
      </ngs-select-trigger>

      <ngs-option value="active">Active</ngs-option>
    </ngs-select>
  `
})
class CustomTriggerHost {
  readonly status = signal(new FormControl<string | null>(null));
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Select,
    Option,
    FilterTrigger
  ],
  template: `
    <ngs-select [formControl]="statuses()" multiple aria-label="Status filter">
      <ngs-filter-trigger [maxCount]="maxCount()" [showZero]="showZero()">Status</ngs-filter-trigger>

      @for (status of statusOptions(); track status.id) {
        <ngs-option [value]="status.id" [data]="status">{{ status.label }}</ngs-option>
      }
    </ngs-select>
  `
})
class MultipleFilterTriggerHost {
  readonly statuses = signal(new FormControl<string[]>(['active', 'pending', 'blocked']));
  readonly maxCount = signal(2);
  readonly showZero = signal(false);
  readonly statusOptions = signal([
    { id: 'active', label: 'Active', tone: 'success' },
    { id: 'pending', label: 'Pending', tone: 'warning' },
    { id: 'blocked', label: 'Blocked', tone: 'danger' }
  ]);
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Select,
    Option,
    FilterTrigger,
    FilterTriggerValueDirective
  ],
  template: `
    <ngs-select [formControl]="status()" aria-label="Status filter">
      <ngs-filter-trigger>
        Status

        @if (customValue()) {
          <ng-template ngsFilterTriggerValue let-status let-text="text" let-count="count" let-multiple="multiple">
            <span class="custom-filter-value">
              {{ status.label }} / {{ status.tone }} / {{ text }} / {{ count }} / {{ multiple }}
            </span>
          </ng-template>
        }
      </ngs-filter-trigger>

      @for (statusOption of statuses(); track statusOption.id) {
        <ngs-option [value]="statusOption.id" [data]="statusOption">
          {{ statusOption.label }}
        </ngs-option>
      }
    </ngs-select>
  `
})
class SingleFilterTriggerHost {
  readonly status = signal(new FormControl('blocked'));
  readonly customValue = signal(false);
  readonly statuses = signal([
    { id: 'active', label: 'Active', tone: 'success' },
    { id: 'blocked', label: 'Blocked', tone: 'danger' }
  ]);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option, FilterTrigger, FilterTriggerValueDirective],
  template: `
    <ngs-select [formControl]="status()" aria-label="Fallback data">
      <ngs-filter-trigger>
        Status
        <ng-template ngsFilterTriggerValue let-data let-text="text">
          <span class="fallback-value">{{ data }} / {{ text }}</span>
        </ng-template>
      </ngs-filter-trigger>

      <ngs-option value="active">Active</ngs-option>
      <ngs-option value="blocked">Blocked</ngs-option>
    </ngs-select>
  `
})
class FallbackDataFilterTriggerHost {
  readonly status = signal(new FormControl('active'));
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option, SelectBody, SelectHeader, SelectFooter],
  template: `
    <ngs-select [formControl]="value()" aria-label="Projected panel">
      <ngs-select-header><div class="panel-header">Header</div></ngs-select-header>
      <ngs-select-body>
        <ngs-option value="inside-body">Inside body</ngs-option>
      </ngs-select-body>
      <ngs-select-footer>
        <div class="panel-footer">Footer</div><button type="button">Footer action</button>
      </ngs-select-footer>
    </ngs-select>
  `
})
class PanelProjectionHost {
  readonly value = signal(new FormControl<string | null>(null));
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, Option],
  template: `
    <ngs-select [formControl]="status()" hideCheckIcon aria-label="Hide check">
      <ngs-option value="active">Active</ngs-option>
      <ngs-option value="blocked">Blocked</ngs-option>
    </ngs-select>
  `
})
class HideCheckIconHost {
  readonly status = signal(new FormControl('active'));
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select],
  template: `
    <ngs-select
      [formControl]="user()"
      [dataSource]="usersDataSource"
      [pageSize]="2"
      searchable
      [searchDebounce]="0"
      aria-label="Async users">
    </ngs-select>
  `
})
class AsyncSelectHost {
  readonly user = signal(new FormControl<string | null>('user_42'));
  readonly requests: SelectDataSourceRequest[] = [];
  readonly usersDataSource: SelectDataSource<{ id: string; name: string }> = vi.fn(async request => {
    this.requests.push(request);

    if (request.reason === 'page') {
      return {
        items: [
          { label: 'Katherine Johnson', value: 'user_12', data: { id: 'user_12', name: 'Katherine Johnson' } }
        ],
        hasMore: false
      };
    }

    if (request.reason === 'initial' || request.search === '') {
      const selectedItems = request.selectedValues.includes('user_12')
        ? [
            { label: 'Katherine Johnson', value: 'user_12', data: { id: 'user_12', name: 'Katherine Johnson' } }
          ]
        : [];

      return {
        items: [
          ...selectedItems,
          { label: 'Ada Lovelace', value: 'user_42', data: { id: 'user_42', name: 'Ada Lovelace' } },
          { label: 'Grace Hopper', value: 'user_7', data: { id: 'user_7', name: 'Grace Hopper' } }
        ],
        hasMore: true,
        nextCursor: 'page-2'
      };
    }

    if (request.reason === 'search') {
      return {
        items: [
          { label: 'Alan Turing', value: 'user_9', data: { id: 'user_9', name: 'Alan Turing' } }
        ],
        hasMore: false
      };
    }

    return [];
  });
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select],
  template: `
    <ngs-select
      [formControl]="users()"
      [dataSource]="usersDataSource"
      [pageSize]="2"
      multiple
      searchable
      [searchDebounce]="0"
      aria-label="Async users multiple">
    </ngs-select>
  `
})
class MultipleAsyncSelectHost {
  readonly users = signal(new FormControl<string[]>(['user_42']));
  readonly usersDataSource: SelectDataSource<{ id: string; name: string }> = async request => {
    if (request.search) {
      return [
        { label: 'Alan Turing', value: 'user_9', data: { id: 'user_9', name: 'Alan Turing' } }
      ];
    }

    return {
      items: [
        { label: 'Ada Lovelace', value: 'user_42', data: { id: 'user_42', name: 'Ada Lovelace' } },
        { label: 'Grace Hopper', value: 'user_7', data: { id: 'user_7', name: 'Grace Hopper' } }
      ],
      hasMore: false
    };
  };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Select, SelectOptionContentDef, SelectValueDef],
  template: `
    <ngs-select
      [formControl]="user()"
      [dataSource]="usersDataSource"
      clearable
      aria-label="Templated async users">
      <ng-template ngsOptionContentDef let-user let-label="label" let-selected="selected">
        <span class="custom-option">{{ user.name }} / {{ user.team }} / {{ selected }} / {{ label }}</span>
      </ng-template>

      <ng-template ngsSelectValueDef let-user let-label="label" let-count="count">
        <span class="custom-value">{{ user.name }} owner / {{ count }} / {{ label }}</span>
      </ng-template>
    </ngs-select>
  `
})
class AsyncTemplateSelectHost {
  readonly user = signal(new FormControl<string | null>('user_42'));
  readonly usersDataSource: SelectDataSource<{ id: string; name: string; team: string }> = async () => ({
    items: [
      { label: 'Ada Lovelace - Platform', value: 'user_42', data: { id: 'user_42', name: 'Ada Lovelace', team: 'Platform' } },
      { label: 'Grace Hopper - Infrastructure', value: 'user_7', data: { id: 'user_7', name: 'Grace Hopper', team: 'Infrastructure' } }
    ],
    hasMore: false
  });
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormField, Select, Option],
  template: `
    <ngs-form-field>
      <ngs-select [formControl]="status()" placeholder="Status">
        <ngs-option value="active">Active</ngs-option>
      </ngs-select>
    </ngs-form-field>
  `
})
class FormFieldSelectHost {
  readonly status = signal(new FormControl<string | null>(null, Validators.required));
}

let overlayContainer: OverlayContainer | undefined;

async function createHost<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  overlayContainer = TestBed.inject(OverlayContainer);
  fixture.detectChanges();

  return fixture;
}

function getSelect(fixture: ComponentFixture<unknown>): Select {
  return fixture.debugElement.query(By.directive(Select)).componentInstance as Select;
}

function getSelectHost(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('ngs-select') as HTMLElement;
}

function getOverlayRoot(): HTMLElement {
  return overlayContainer?.getContainerElement() as HTMLElement;
}

function getOverlayOptions(): HTMLElement[] {
  return Array.from(getOverlayRoot().querySelectorAll('ngs-option'));
}

function getPanel(): HTMLElement {
  return getOverlayRoot().querySelector('.ngs-select-panel') as HTMLElement;
}

function keydown(element: HTMLElement, key: string): KeyboardEvent {
  const codes: Record<string, number> = {
    ArrowDown: 40, ArrowUp: 38, Home: 36, End: 35, Enter: 13, ' ': 32, Escape: 27, Tab: 9,
  };
  const event = new KeyboardEvent('keydown', { key, keyCode: codes[key], bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

function openSelect(fixture: ComponentFixture<unknown>): void {
  getSelectHost(fixture).click();
  fixture.detectChanges();
}

async function flushAsyncSelect(fixture: ComponentFixture<unknown>): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  fixture.detectChanges();
}

function clickOverlayOption(fixture: ComponentFixture<unknown>, index: number): void {
  getOverlayOptions()[index].click();
  fixture.detectChanges();
}

afterEach(() => {
  overlayContainer?.ngOnDestroy();
  overlayContainer = undefined;
});

describe('Select', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('focuses ordinary and filter selects on Tab and opens only after a keyboard action', async () => {
    const fixture = await createHost(KeyboardFocusHost);
    const ordinary = fixture.nativeElement.querySelector('.ordinary') as HTMLElement;
    const filter = fixture.nativeElement.querySelector('.filter') as HTMLElement;
    (fixture.nativeElement.querySelector('.before') as HTMLElement).focus();
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(ordinary);
    expect(ordinary.getAttribute('aria-expanded')).toBe('false');
    expect(getPanel()).toBeNull();
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(ordinary.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{Escape}');
    fixture.detectChanges();
    expect(document.activeElement).toBe(ordinary);
    expect(ordinary.getAttribute('aria-expanded')).toBe('false');
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(filter);
    expect(filter.getAttribute('aria-expanded')).toBe('false');
    expect(getPanel()).toBeNull();
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    fixture.detectChanges();
    expect(fixture.componentInstance.status.value).toBe('pending');
    expect(document.activeElement).toBe(filter);
    expect(filter.getAttribute('aria-expanded')).toBe('false');
    await userEvent.tab();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.after'));
    await userEvent.tab({ shift: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(filter);
    expect(filter.getAttribute('aria-expanded')).toBe('false');
    expect(getPanel()).toBeNull();
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(filter.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps programmatic focus separate from opening and opens once on a mouse click', async () => {
    const fixture = await createHost(KeyboardFocusHost);
    const select = getSelect(fixture);
    select.focus();
    fixture.detectChanges();
    expect(select.focused).toBe(true);
    expect(select.panelOpen()).toBe(false);
    await userEvent.click(getSelectHost(fixture));
    fixture.detectChanges();
    expect(select.panelOpen()).toBe(true);
    expect(getSelectHost(fixture).getAttribute('aria-activedescendant')).toBeNull();
    expect(getOverlayOptions().some(option => option.classList.contains('ngs-option-active'))).toBe(false);
    await userEvent.keyboard('{ArrowDown}');
    fixture.detectChanges();
    expect(getSelectHost(fixture).getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[0].id);
    expect(getOverlayOptions()[0].classList.contains('ngs-option-active')).toBe(true);
  });

  it('does not highlight checked options when a multiple select is opened and used with the mouse', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const styles = document.createElement('style');
    styles.textContent = '.ngs-select-panel { --ngs-option-active-background: rgb(17, 34, 51); }';
    document.head.appendChild(styles);
    try {
      await userEvent.click(getSelectHost(fixture));
      fixture.detectChanges();
      const options = getOverlayOptions();
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options.some(option => option.classList.contains('ngs-option-active'))).toBe(false);
      expect(getComputedStyle(options[0]).backgroundColor).not.toBe('rgb(17, 34, 51)');
      expect(getSelectHost(fixture).getAttribute('aria-activedescendant')).toBeNull();
      await userEvent.click(options[1]);
      fixture.detectChanges();
      expect(options[1].getAttribute('aria-selected')).toBe('true');
      expect(options.some(option => option.classList.contains('ngs-option-active'))).toBe(false);
      expect(getComputedStyle(options[1]).backgroundColor).not.toBe('rgb(17, 34, 51)');
      expect(getSelect(fixture).panelOpen()).toBe(true);
    } finally {
      styles.remove();
    }
  });

  it('shows a keyboard focus outline on Filter Select while keeping it closed on Tab', async () => {
    const fixture = await createHost(KeyboardFocusHost);
    const filter = fixture.nativeElement.querySelector('.filter') as HTMLElement;
    filter.style.setProperty('--ngs-state-focus-ring', 'rgb(17, 34, 51)');
    (fixture.nativeElement.querySelector('.before') as HTMLElement).focus();
    await userEvent.tab();
    await userEvent.tab();
    fixture.detectChanges();
    expect(document.activeElement).toBe(filter);
    expect(filter.getAttribute('aria-expanded')).toBe('false');
    expect(getComputedStyle(filter).outlineStyle).toBe('solid');
    expect(getComputedStyle(filter).outlineWidth).toBe('2px');
    expect(getComputedStyle(filter).outlineColor).toBe('rgb(17, 34, 51)');
    await userEvent.tab();
    fixture.detectChanges();
    expect(getComputedStyle(filter).outlineStyle).toBe('none');
    await userEvent.tab({ shift: true });
    fixture.detectChanges();
    expect(document.activeElement).toBe(filter);
    expect(getComputedStyle(filter).outlineStyle).toBe('solid');
    expect(filter.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders combobox accessibility attributes, placeholder, and empty state', async () => {
    const fixture = await createHost(SingleSelectHost);
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    expect(host.getAttribute('role')).toBe('combobox');
    expect(host.getAttribute('aria-autocomplete')).toBe('none');
    expect(host.getAttribute('aria-haspopup')).toBe('listbox');
    expect(host.getAttribute('aria-label')).toBe('Status');
    expect(host.getAttribute('aria-required')).toBe('true');
    expect(host.getAttribute('tabindex')).toBe('5');
    expect(host.getAttribute('aria-expanded')).toBe('false');
    expect(host.classList.contains('ngs-select-empty')).toBe(true);
    expect(select.hasValue()).toBe(false);
    expect(host.textContent).toContain('Choose status');
  });

  it('opens and closes the panel, updates aria-expanded, and emits lifecycle outputs', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    openSelect(fixture);

    expect(select.panelOpen()).toBe(true);
    expect(host.getAttribute('aria-expanded')).toBe('true');
    expect(host.classList.contains('ngs-select-panel-open')).toBe(true);
    expect(component.opened()).toBe(1);
    expect(getOverlayRoot().querySelector('.ngs-select-panel')).toBeTruthy();
    expect(getOverlayOptions().length).toBe(4);

    select.close();
    fixture.detectChanges();

    expect(select.panelOpen()).toBe(false);
    expect(host.getAttribute('aria-expanded')).toBe('false');
    expect(host.classList.contains('ngs-select-panel-open')).toBe(false);
    expect(component.closed()).toBe(1);
  });

  it('does not open while disabled from the disabled input', async () => {
    const fixture = await createHost(DisabledInputHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    openSelect(fixture);

    expect(select.panelOpen()).toBe(false);
    expect(host.classList.contains('ngs-select-disabled')).toBe(true);
    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.getAttribute('tabindex')).toBe('-1');

    component.disabled.set(false);
    fixture.detectChanges();
    openSelect(fixture);

    expect(select.panelOpen()).toBe(true);
  });

  it('integrates with FormControl disabled state', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    component.status().disable();
    fixture.detectChanges();
    openSelect(fixture);

    expect(select.disabled).toBe(true);
    expect(select.panelOpen()).toBe(false);

    component.status().enable();
    fixture.detectChanges();
    openSelect(fixture);

    expect(select.disabled).toBe(false);
    expect(select.panelOpen()).toBe(true);
  });

  it('selects a single option, updates the form value, emits SelectChange, and closes', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    openSelect(fixture);
    clickOverlayOption(fixture, 0);

    expect(component.status().value).toBe('active');
    expect(select.value()).toBe('active');
    expect(select.triggerValue()).toBe('Active');
    expect(select.selectedCount()).toBe(1);
    expect(select.selectedData()).toBe('active');
    expect(select.hasValue()).toBe(true);
    expect(select.panelOpen()).toBe(false);
    expect(component.changes().length).toBe(1);
    expect(component.changes()[0].source).toBe(select);
    expect(component.changes()[0].value).toBe('active');
    expect(getSelectHost(fixture).textContent).toContain('Active');
  });

  it('does not select disabled options', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    openSelect(fixture);
    clickOverlayOption(fixture, 2);

    expect(component.status().value).toBeNull();
    expect(select.value()).toBeNull();
    expect(select.empty).toBe(true);
    expect(component.changes().length).toBe(0);
    expect(select.panelOpen()).toBe(true);
  });

  it('clears single selection when an option has a null value', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    component.status().setValue('active');
    fixture.detectChanges();
    openSelect(fixture);
    clickOverlayOption(fixture, 3);

    expect(component.status().value).toBeNull();
    expect(select.value()).toBeNull();
    expect(select.selectedCount()).toBe(0);
    expect(select.empty).toBe(true);
    expect(select.triggerValue()).toBe('');
  });

  it('opens with Enter and selects the active option with Space', async () => {
    const fixture = await createHost(SingleSelectHost);
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    host.dispatchEvent(enter);
    fixture.detectChanges();
    expect(enter.defaultPrevented).toBe(true);
    expect(select.panelOpen()).toBe(true);

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    host.dispatchEvent(space);
    fixture.detectChanges();
    expect(space.defaultPrevented).toBe(true);
    expect(select.panelOpen()).toBe(false);
    expect(fixture.componentInstance.status().value).toBe('active');
  });

  it('navigates with arrows and Home/End, skips disabled options, and exposes the active descendant', async () => {
    const fixture = await createHost(SingleSelectHost);
    const host = getSelectHost(fixture);
    host.focus();
    keydown(host, 'ArrowDown');
    fixture.detectChanges();
    expect(getPanel().getAttribute('role')).toBe('listbox');
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[0].id);
    keydown(host, 'ArrowDown');
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[1].id);
    keydown(host, 'ArrowDown');
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[3].id);
    keydown(host, 'Home');
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[0].id);
    keydown(host, 'End');
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[3].id);
    keydown(host, 'ArrowUp');
    keydown(host, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.status().value).toBe('pending');
    expect(document.activeElement).toBe(host);
    expect(host.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('keeps the active option on reorder and replaces removed options without selecting them', async () => {
    const fixture = await createHost(SingleSelectHost);
    const host = getSelectHost(fixture);
    openSelect(fixture);
    keydown(host, 'ArrowDown');
    fixture.detectChanges();
    const activeId = host.getAttribute('aria-activedescendant');
    fixture.componentInstance.options.update(options => [options[1], options[0], options[2], options[3]]);
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(activeId);
    fixture.componentInstance.options.update(options => options.filter(option => option.value !== 'pending'));
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[0].id);
    expect(fixture.componentInstance.status().value).toBeNull();
  });

  it('closes with Escape or Tab without changing the value', async () => {
    const fixture = await createHost(SingleSelectHost);
    const host = getSelectHost(fixture);
    host.focus();
    openSelect(fixture);
    keydown(host, 'ArrowDown');
    const escape = keydown(host, 'Escape');
    fixture.detectChanges();
    expect(escape.defaultPrevented).toBe(true);
    expect(getSelect(fixture).panelOpen()).toBe(false);
    expect(fixture.componentInstance.status().value).toBeNull();
    expect(document.activeElement).toBe(host);
    openSelect(fixture);
    const tab = keydown(host, 'Tab');
    fixture.detectChanges();
    expect(tab.defaultPrevented).toBe(false);
    expect(getSelect(fixture).panelOpen()).toBe(false);
  });

  it('toggles multiple options from the keyboard while keeping the panel open', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const host = getSelectHost(fixture);
    openSelect(fixture);
    keydown(host, ' ');
    fixture.detectChanges();
    expect(fixture.componentInstance.teams().value).toEqual(['Support']);
    expect(getSelect(fixture).panelOpen()).toBe(true);
    keydown(host, 'ArrowDown');
    keydown(host, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.teams().value).toEqual(['Support', 'Engineering']);
  });

  it('keeps the active background on checked options while navigating and toggling selection', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const styles = document.createElement('style');
    styles.textContent = '.ngs-select-panel { --ngs-option-active-background: rgb(17, 34, 51); }';
    document.head.appendChild(styles);
    try {
      getSelect(fixture).focus();
      await userEvent.keyboard('{Enter}');
      fixture.detectChanges();
      const options = getOverlayOptions();
      const checked = (index: number): boolean =>
        (options[index].querySelector('input[type=checkbox]') as HTMLInputElement).checked;
      expect(checked(0)).toBe(true);
      expect(options[0].classList.contains('ngs-option-active')).toBe(true);
      expect(getComputedStyle(options[0]).backgroundColor).toBe('rgb(17, 34, 51)');
      expect(checked(3)).toBe(true);
      expect(getComputedStyle(options[3]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();
      expect(getComputedStyle(options[1]).backgroundColor).toBe('rgb(17, 34, 51)');
      expect(getComputedStyle(options[0]).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await userEvent.keyboard('{ArrowUp}');
      fixture.detectChanges();
      expect(checked(0)).toBe(true);
      expect(getComputedStyle(options[0]).backgroundColor).toBe('rgb(17, 34, 51)');
      await userEvent.keyboard(' ');
      fixture.detectChanges();
      expect(checked(0)).toBe(false);
      expect(getComputedStyle(options[0]).backgroundColor).toBe('rgb(17, 34, 51)');
      await userEvent.keyboard(' ');
      fixture.detectChanges();
      expect(checked(0)).toBe(true);
      expect(getComputedStyle(options[0]).backgroundColor).toBe('rgb(17, 34, 51)');
      expect(getSelect(fixture).panelOpen()).toBe(true);
    } finally {
      styles.remove();
    }
  });

  it('skips hidden options and disabled groups, including when opening with ArrowUp', async () => {
    const fixture = await createHost(UnavailableOptionsHost);
    const host = getSelectHost(fixture);
    keydown(host, 'ArrowUp');
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[2].id);
    keydown(host, 'ArrowUp');
    keydown(host, 'Enter');
    fixture.detectChanges();
    expect(getSelect(fixture).value()).toBe('visible');
  });

  it('finds options by typing their labels without selecting them', async () => {
    const fixture = await createHost(SingleSelectHost);
    const host = getSelectHost(fixture);
    openSelect(fixture);
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', keyCode: 80, bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 250));
    fixture.detectChanges();
    expect(host.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[1].id);
    expect(fixture.componentInstance.status().value).toBeNull();
  });

  it('uses keyboard navigation in the async search input without consuming editing keys', async () => {
    const fixture = await createHost(AsyncSelectHost);
    openSelect(fixture);
    await flushAsyncSelect(fixture);
    const search = getPanel().querySelector('input') as HTMLInputElement;
    search.focus();
    for (const key of [' ', 'Home', 'End']) {
      expect(keydown(search, key).defaultPrevented).toBe(false);
    }
    search.value = 'Alan';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    keydown(search, 'ArrowDown');
    fixture.detectChanges();
    expect(search.getAttribute('aria-activedescendant')).toBe(getOverlayOptions()[0].id);
    keydown(search, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.user().value).toBe('user_9');
    expect(document.activeElement).toBe(getSelectHost(fixture));
  });

  it('handles Escape and Tab from interactive controls inside the panel', async () => {
    const fixture = await createHost(PanelProjectionHost);
    openSelect(fixture);
    const button = getPanel().querySelector('button') as HTMLButtonElement;
    button.focus();
    keydown(button, 'Escape');
    fixture.detectChanges();
    expect(getSelect(fixture).panelOpen()).toBe(false);
    expect(document.activeElement).toBe(getSelectHost(fixture));
    openSelect(fixture);
    const nextButton = getPanel().querySelector('button') as HTMLButtonElement;
    nextButton.focus();
    expect(keydown(nextButton, 'Tab').defaultPrevented).toBe(false);
    fixture.detectChanges();
    expect(getSelect(fixture).panelOpen()).toBe(false);
  });

  it('tracks focus, blur, touched state, and shouldLabelFloat', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    host.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(select.focused).toBe(true);
    expect(select.shouldLabelFloat).toBe(true);

    host.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(select.focused).toBe(false);
    expect(component.status().touched).toBe(true);

    component.status().setValue('active');
    fixture.detectChanges();
    expect(select.shouldLabelFloat).toBe(true);
  });

  it('reflects required validation errors on the host', async () => {
    const fixture = await createHost(SingleSelectHost);
    const component = fixture.componentInstance;
    const host = getSelectHost(fixture);

    expect(host.classList.contains('ngs-select-invalid')).toBe(false);

    component.status().markAsTouched();
    fixture.detectChanges();

    expect(host.classList.contains('ngs-select-invalid')).toBe(true);
    expect(host.getAttribute('aria-invalid')).toBe('true');

    component.status().setValue('active');
    fixture.detectChanges();

    expect(host.classList.contains('ngs-select-invalid')).toBe(false);
  });

  it('keeps multiple select open and updates selected values, count, data, and trigger text', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    expect(select.multiple()).toBe(true);
    expect(select.selectedCount()).toBe(2);
    expect(select.selectedData()).toEqual(['Design', 'Support']);
    expect(select.triggerValue()).toBe('Design, Support');
    expect(select.hasValue()).toBe(true);

    openSelect(fixture);
    const options = getOverlayOptions();

    expect(options[0].classList.contains('ngs-option-selected')).toBe(true);
    expect(options[1].classList.contains('ngs-option-selected')).toBe(false);
    expect(options[3].classList.contains('ngs-option-selected')).toBe(true);
    expect(options[0].querySelector('ngs-checkbox')).toBeTruthy();

    clickOverlayOption(fixture, 1);

    expect(component.teams().value).toEqual(['Design', 'Support', 'Engineering']);
    expect(select.selectedCount()).toBe(3);
    expect(select.triggerValue()).toBe('Design, Support, Engineering');
    expect(select.panelOpen()).toBe(true);

    clickOverlayOption(fixture, 0);

    expect(component.teams().value).toEqual(['Support', 'Engineering']);
    expect(select.selectedCount()).toBe(2);
    expect(select.selectedData()).toEqual(['Support', 'Engineering']);
  });

  it('rebuilds selection when multiple option values change through the form control', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    component.teams().setValue(['Product']);
    fixture.detectChanges();

    expect(select.selectedCount()).toBe(1);
    expect(select.triggerValue()).toBe('Product');
    expect(select.selectedData()).toEqual(['Product']);
  });

  it('shows a clear button only when clearable select has a value', async () => {
    const fixture = await createHost(ClearableSingleSelectHost);
    const component = fixture.componentInstance;
    const host = getSelectHost(fixture);

    expect(host.classList.contains('ngs-select-clearable')).toBe(true);
    expect(host.classList.contains('ngs-select-has-clear')).toBe(true);
    expect(host.querySelector('.ngs-select-clear-button')).toBeTruthy();

    component.status().setValue(null);
    fixture.detectChanges();

    expect(host.classList.contains('ngs-select-has-clear')).toBe(false);
    expect(host.querySelector('.ngs-select-clear-button')).toBeNull();
  });

  it('clears a single select value without opening the panel', async () => {
    const fixture = await createHost(ClearableSingleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);
    const clearButton = host.querySelector('.ngs-select-clear-button') as HTMLButtonElement;

    clearButton.click();
    fixture.detectChanges();

    expect(component.status().value).toBeNull();
    expect(select.value()).toBeNull();
    expect(select.empty).toBe(true);
    expect(select.hasValue()).toBe(false);
    expect(select.panelOpen()).toBe(false);
    expect(component.changes().length).toBe(1);
    expect(component.changes()[0].value).toBeNull();
    expect(host.querySelector('.ngs-select-clear-button')).toBeNull();
  });

  it('clears a multiple select value to an empty array without opening the panel', async () => {
    const fixture = await createHost(ClearableMultipleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);
    const clearButton = host.querySelector('.ngs-select-clear-button') as HTMLButtonElement;

    clearButton.click();
    fixture.detectChanges();

    expect(component.teams().value).toEqual([]);
    expect(select.value()).toEqual([]);
    expect(select.selectedCount()).toBe(0);
    expect(select.empty).toBe(true);
    expect(select.hasValue()).toBe(false);
    expect(select.panelOpen()).toBe(false);
    expect(component.changes().length).toBe(1);
    expect(component.changes()[0].value).toEqual([]);
  });

  it('updates option display text when projected option content changes', async () => {
    const fixture = await createHost(MultipleSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    component.teamOptions.set(['Design updated', 'Engineering', 'Product', 'Support']);
    component.teams().setValue(['Design updated']);
    fixture.detectChanges();

    expect(select.triggerValue()).toBe('Design updated');
  });

  it('projects a custom select trigger even when the select has no value', async () => {
    const fixture = await createHost(CustomTriggerHost);
    const host = getSelectHost(fixture);

    expect(host.textContent).toContain('Custom status trigger');
    expect(host.textContent).not.toContain('Native placeholder');
  });

  it('renders multiple filter trigger count with maxCount and showZero behavior', async () => {
    const fixture = await createHost(MultipleFilterTriggerHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    expect(host.classList.contains('ngs-select-has-filter-trigger')).toBe(true);
    expect(host.textContent).toContain('Status');
    expect(host.querySelector('.ngs-filter-trigger-badge')?.textContent?.trim()).toBe('2+');
    expect(select.selectedData()).toEqual([
      { id: 'active', label: 'Active', tone: 'success' },
      { id: 'pending', label: 'Pending', tone: 'warning' },
      { id: 'blocked', label: 'Blocked', tone: 'danger' }
    ]);

    component.statuses().setValue([]);
    fixture.detectChanges();

    expect(host.querySelector('.ngs-filter-trigger-badge')).toBeNull();

    component.showZero.set(true);
    fixture.detectChanges();

    expect(host.querySelector('.ngs-filter-trigger-badge')?.textContent?.trim()).toBe('0');
  });

  it('adds filter-trigger open classes and rotates the arrow while opened', async () => {
    const fixture = await createHost(MultipleFilterTriggerHost);
    const host = getSelectHost(fixture);
    const arrowWrapper = host.querySelector('.ngs-select-arrow-wrapper') as HTMLElement;

    expect(host.classList.contains('ngs-select-has-filter-trigger')).toBe(true);
    expect(getComputedStyle(arrowWrapper).transform).toBe('none');

    openSelect(fixture);

    expect(host.classList.contains('ngs-select-panel-open')).toBe(true);
    expect(getComputedStyle(arrowWrapper).transform).not.toBe('none');
  });

  it('renders single filter trigger selected text without custom value template', async () => {
    const fixture = await createHost(SingleFilterTriggerHost);
    const host = getSelectHost(fixture);

    expect(host.textContent).toContain('Status');
    expect(host.querySelector('.ngs-filter-trigger-value')?.textContent?.trim()).toBe('Blocked');
    expect(host.querySelector('.ngs-filter-trigger-badge')).toBeNull();
  });

  it('renders custom filter trigger value from option data and exposes template context', async () => {
    const fixture = await createHost(SingleFilterTriggerHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    component.customValue.set(true);
    fixture.detectChanges();

    expect(select.selectedData()).toEqual({ id: 'blocked', label: 'Blocked', tone: 'danger' });
    expect(getSelectHost(fixture).querySelector('.custom-filter-value')?.textContent?.trim()).toBe(
      'Blocked / danger / Blocked / 1 / false'
    );
  });

  it('falls back to the option value as selectedData when ngs-option data is not provided', async () => {
    const fixture = await createHost(FallbackDataFilterTriggerHost);
    const select = getSelect(fixture);
    const host = getSelectHost(fixture);

    expect(select.selectedData()).toBe('active');
    expect(host.querySelector('.fallback-value')?.textContent?.trim()).toBe('active / Active');
  });

  it('projects select header, body, and footer into the overlay panel', async () => {
    const fixture = await createHost(PanelProjectionHost);

    openSelect(fixture);

    const overlay = getOverlayRoot();
    expect(overlay.querySelector('.panel-header')?.textContent).toContain('Header');
    expect(overlay.querySelector('.ngs-select-body')).toBeTruthy();
    expect(overlay.querySelector('.panel-footer')?.textContent).toContain('Footer');
    expect(overlay.querySelector('.ngs-select-content')).toBeNull();

    clickOverlayOption(fixture, 0);

    expect(fixture.componentInstance.value().value).toBe('inside-body');
  });

  it('hides the selected check icon when hideCheckIcon is true', async () => {
    const fixture = await createHost(HideCheckIconHost);

    openSelect(fixture);

    const selectedOption = getOverlayOptions()[0];
    expect(selectedOption.classList.contains('ngs-option-selected')).toBe(true);
    expect(selectedOption.querySelector('ngs-icon')).toBeNull();
  });

  it('loads selected async options on the first data source request', async () => {
    const fixture = await createHost(AsyncSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    await flushAsyncSelect(fixture);

    expect(component.requests.length).toBe(0);
    expect(select.triggerValue()).toBe('');

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    expect(component.requests[0].reason).toBe('initial');
    expect(component.requests[0].selectedValues).toEqual(['user_42']);
    expect(component.requests[0].page).toBe(1);
    expect(component.requests[0].pageSize).toBe(2);
    expect(select.triggerValue()).toBe('Ada Lovelace');
    expect(select.selectedData()).toEqual({ id: 'user_42', name: 'Ada Lovelace' });

    expect(getOverlayOptions().map(option => option.textContent?.trim())).toEqual([
      'Ada Lovelace',
      'Grace Hopper'
    ]);
  });

  it('loads a missing selected async option when reopening with a changed value', async () => {
    const fixture = await createHost(AsyncSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    select.close();
    component.user().setValue('user_12');
    fixture.detectChanges();

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    expect(component.requests.at(-1)?.reason).toBe('initial');
    expect(component.requests.at(-1)?.selectedValues).toEqual(['user_12']);
    expect(select.triggerValue()).toBe('Katherine Johnson');
    expect(select.selectedData()).toEqual({ id: 'user_12', name: 'Katherine Johnson' });
  });

  it('reloads async options from search and appends the next page on scroll', async () => {
    vi.useFakeTimers();
    const fixture = await createHost(AsyncSelectHost);
    const component = fixture.componentInstance;

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    const searchInput = getOverlayRoot().querySelector('.ngs-select-search-input') as HTMLInputElement;
    searchInput.value = 'alan';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    vi.runOnlyPendingTimers();
    await flushAsyncSelect(fixture);

    expect(component.requests.at(-1)?.reason).toBe('search');
    expect(component.requests.at(-1)?.search).toBe('alan');
    expect(getOverlayOptions().map(option => option.textContent?.trim())).toEqual(['Alan Turing']);

    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    vi.runOnlyPendingTimers();
    await flushAsyncSelect(fixture);

    const content = getOverlayRoot().querySelector('.ngs-select-async-content') as HTMLElement;
    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 100 });
    Object.defineProperty(content, 'clientHeight', { configurable: true, value: 80 });
    Object.defineProperty(content, 'scrollTop', { configurable: true, value: 20 });
    content.dispatchEvent(new Event('scroll'));
    await flushAsyncSelect(fixture);

    expect(component.requests.at(-1)?.reason).toBe('page');
    expect(component.requests.at(-1)?.cursor).toBe('page-2');
    expect(getOverlayOptions().map(option => option.textContent?.trim())).toEqual([
      'Ada Lovelace',
      'Grace Hopper',
      'Katherine Johnson'
    ]);
  });

  it('keeps hidden async multiple selections when selecting search results', async () => {
    vi.useFakeTimers();
    const fixture = await createHost(MultipleAsyncSelectHost);
    const component = fixture.componentInstance;
    const select = getSelect(fixture);

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    const searchInput = getOverlayRoot().querySelector('.ngs-select-search-input') as HTMLInputElement;
    searchInput.value = 'alan';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    vi.runOnlyPendingTimers();
    await flushAsyncSelect(fixture);

    clickOverlayOption(fixture, 0);

    expect(component.users().value).toEqual(['user_42', 'user_9']);
    expect(select.triggerValue()).toBe('Ada Lovelace, Alan Turing');
    expect(select.selectedData()).toEqual([
      { id: 'user_42', name: 'Ada Lovelace' },
      { id: 'user_9', name: 'Alan Turing' }
    ]);
  });

  it('renders async options and selected value with custom template defs', async () => {
    const fixture = await createHost(AsyncTemplateSelectHost);
    const select = getSelect(fixture);

    expect(select.empty).toBe(true);
    expect(getSelectHost(fixture).querySelector('.ngs-select-clear-button')).toBeNull();
    expect(getSelectHost(fixture).querySelector('.custom-value')).toBeNull();
    expect(getSelectHost(fixture).textContent).not.toContain('owner');

    openSelect(fixture);
    await flushAsyncSelect(fixture);

    const options = getOverlayOptions();

    expect(options[0].querySelector('.custom-option')?.textContent?.trim()).toBe(
      'Ada Lovelace / Platform / true / Ada Lovelace - Platform'
    );
    expect(options[1].querySelector('.custom-option')?.textContent?.trim()).toBe(
      'Grace Hopper / Infrastructure / false / Grace Hopper - Infrastructure'
    );
    expect(select.empty).toBe(false);
    expect(getSelectHost(fixture).querySelector('.ngs-select-clear-button')).toBeTruthy();
    expect(getSelectHost(fixture).querySelector('.custom-value')?.textContent?.trim()).toBe(
      'Ada Lovelace owner / 1 / Ada Lovelace - Platform'
    );
  });

  it('works inside ngs-form-field and updates the field focus/error state', async () => {
    const fixture = await createHost(FormFieldSelectHost);
    const component = fixture.componentInstance;
    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;
    const select = getSelect(fixture);

    openSelect(fixture);
    // The trigger width is measured when the overlay opens.
    expect(select.overlayWidth).toBeTypeOf('number');
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(true);

    select.close();
    fixture.detectChanges();
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(true);

    getSelectHost(fixture).blur();
    component.status().markAsTouched();
    fixture.detectChanges();

    expect(formField.classList.contains('ngs-form-field-focused')).toBe(false);
    expect(getSelectHost(fixture).classList.contains('ngs-select-invalid')).toBe(true);
  });
});
