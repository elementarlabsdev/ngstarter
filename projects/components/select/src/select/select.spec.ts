import '@angular/compiler';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FormField } from '../../../form-field/src/form-field/form-field';
import { Option } from '../../../option/src/option/option';
import { FilterTrigger } from '../filter-trigger/filter-trigger';
import { FilterTriggerValueDirective } from '../filter-trigger/filter-trigger-value.directive';
import { SelectBody } from '../select-body/select-body';
import { SelectFooter } from '../select-footer/select-footer';
import { SelectHeader } from '../select-header/select-header';
import { SelectTrigger } from '../select-trigger/select-trigger';
import { Select, SelectChange } from './select';

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
      <ngs-select-footer><div class="panel-footer">Footer</div></ngs-select-footer>
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

function openSelect(fixture: ComponentFixture<unknown>): void {
  getSelectHost(fixture).click();
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

  it('toggles the panel from keyboard Enter and Space events', async () => {
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

  it('works inside ngs-form-field and updates the field focus/error state', async () => {
    const fixture = await createHost(FormFieldSelectHost);
    const component = fixture.componentInstance;
    const formField = fixture.nativeElement.querySelector('ngs-form-field') as HTMLElement;
    const select = getSelect(fixture);

    expect(select.overlayWidth).toBeTypeOf('number');

    openSelect(fixture);
    expect(formField.classList.contains('ngs-form-field-focused')).toBe(true);

    select.close();
    component.status().markAsTouched();
    fixture.detectChanges();

    expect(formField.classList.contains('ngs-form-field-focused')).toBe(false);
    expect(getSelectHost(fixture).classList.contains('ngs-select-invalid')).toBe(true);
  });
});
