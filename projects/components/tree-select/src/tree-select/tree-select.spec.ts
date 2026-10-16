import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TreeSelect } from './tree-select';
import { TreeSelectNode } from '../tree-select.types';

const nodes: TreeSelectNode[] = [
  {
    value: 'team',
    label: 'Team',
    children: [
      { value: 'design', label: 'Design' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'blocked', label: 'Blocked', disabled: true },
    ],
  },
];

@Component({
  imports: [TreeSelect, ReactiveFormsModule],
  template:
    '<ngs-tree-select [nodes]="nodes" [formControl]="control" clearable aria-label="Department" />',
})
class FormHost {
  readonly nodes = nodes;
  readonly control = new FormControl<string | null>(null, Validators.required);
}

@Component({
  imports: [TreeSelect, FormField, Label, ReactiveFormsModule],
  template: `
    <ngs-form-field labelMode="floating">
      <ngs-label>Department</ngs-label>
      <ngs-tree-select [nodes]="nodes" [formControl]="control" clearable />
    </ngs-form-field>
  `,
})
class FormFieldHost extends FormHost {}

describe('TreeSelect', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

  function create() {
    const fixture = TestBed.createComponent(TreeSelect);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.detectChanges();
    return fixture;
  }

  it('handles padding and trigger clicks once through the form field', () => {
    const fixture = TestBed.createComponent(FormFieldHost);
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector('.ngs-form-field-infix') as HTMLElement;
    const trigger = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    const isOpen = () => trigger.getAttribute('aria-expanded');

    field.click();
    fixture.detectChanges();
    expect(isOpen()).toBe('true');
    trigger.click();
    fixture.detectChanges();
    expect(isOpen()).toBe('false');
    trigger.click();
    fixture.detectChanges();
    expect(isOpen()).toBe('true');
    field.click();
    fixture.detectChanges();
    expect(isOpen()).toBe('false');

    fixture.componentInstance.control.setValue('design');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.ngs-select-clear-button') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(isOpen()).toBe('false');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    field.click();
    fixture.detectChanges();
    expect(isOpen()).toBe('false');
  });

  it('does not emit form changes on writeValue and preserves numeric zero keys', () => {
    const fixture = create();
    const change = vi.fn();
    fixture.componentInstance.registerOnChange(change);
    fixture.componentInstance.writeValue(0);
    fixture.detectChanges();
    expect(fixture.componentInstance.empty).toBe(false);
    expect(fixture.componentInstance.displayValue()).toBe('0');
    expect(change).not.toHaveBeenCalled();
  });

  it('cascades to enabled leaves and reports mixed state independently of search clones', () => {
    const fixture = create();
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    const select = fixture.componentInstance;
    select.select(nodes[0].children![0]);
    expect(select.isIndeterminate(nodes[0])).toBe(true);
    select.select({ ...nodes[0], children: [nodes[0].children![0]] });
    expect(select.value).toEqual(['design', 'engineering']);
    expect(select.isChecked(nodes[0])).toBe(true);
    select.select(nodes[0]);
    expect(select.value).toEqual([]);
  });

  it('supports independent node selection and leavesOnly', () => {
    const fixture = create();
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('cascade', false);
    fixture.detectChanges();
    const select = fixture.componentInstance;
    select.select(nodes[0]);
    expect(select.value).toEqual(['team']);
    fixture.componentRef.setInput('leavesOnly', true);
    fixture.detectChanges();
    expect(select.canSelect(nodes[0])).toBe(false);
  });

  it('blocks disabled descendants and disabled clear/open actions', () => {
    const fixture = create();
    fixture.componentRef.setInput('nodes', [{ ...nodes[0], disabled: true }]);
    fixture.detectChanges();
    const select = fixture.componentInstance;
    select.select(nodes[0].children![0]);
    expect(select.value).toBeNull();
    select.writeValue('design');
    select.setDisabledState(true);
    select.clear(new Event('click'));
    select.open();
    expect(select.value).toBe('design');
    expect(select.panelOpen()).toBe(false);
  });

  it('integrates reactive forms, selection, touched, reset, and disabled state', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const select = fixture.debugElement.children[0].componentInstance as TreeSelect;
    select.open();
    await fixture.whenStable();
    select.select(nodes[0].children![0]);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('design');
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.componentInstance.control.reset();
    fixture.detectChanges();
    expect(select.empty).toBe(true);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('opens a tree popup, keeps ancestors when searching, and closes on Escape', async () => {
    const fixture = create();
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('[role="tree"]')).not.toBeNull();
    fixture.componentInstance.query.set('Design');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.textContent).toContain('Team');
    expect(overlay.textContent).toContain('Design');
    expect(overlay.textContent).not.toContain('Engineering');
    overlay
      .querySelector('ngs-tree-select-panel')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.panelOpen()).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('[role="combobox"]'));
  });

  it('selects from keyboard tree activation', async () => {
    const fixture = create();
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    const node = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector<HTMLElement>('ngs-tree-node')!;
    node.focus();
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('team');
  });

  it('loads children once requested, retains input nodes, and ignores stale root responses', async () => {
    const fixture = create();
    const root: TreeSelectNode = { value: 'remote', label: 'Remote', hasChildren: true };
    let resolve!: (nodes: TreeSelectNode[]) => void;
    const loader = vi.fn(() => new Promise<TreeSelectNode[]>((done) => (resolve = done)));
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('loadChildren', loader);
    fixture.detectChanges();
    const promise = fixture.componentInstance.load(root);
    await fixture.componentInstance.load(root);
    expect(loader).toHaveBeenCalledTimes(1);
    resolve([{ value: 'loaded', label: 'Loaded' }]);
    await promise;
    expect(fixture.componentInstance.resolvedNodes()[0].children?.[0].value).toBe('loaded');
    expect(root.children).toBeUndefined();
    const stale = fixture.componentInstance.load(root);
    fixture.componentRef.setInput('nodes', [{ value: 'replacement', label: 'Replacement' }]);
    fixture.detectChanges();
    resolve([{ value: 'stale', label: 'Stale' }]);
    await stale;
    expect(fixture.componentInstance.allNodes().has('stale')).toBe(false);
  });

  it('emits load errors and supports retry', async () => {
    const fixture = create();
    const root: TreeSelectNode = { value: 'remote', label: 'Remote', hasChildren: true };
    const loader = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue([]);
    fixture.componentRef.setInput('nodes', [root]);
    fixture.componentRef.setInput('loadChildren', loader);
    fixture.detectChanges();
    const errors = vi.fn();
    fixture.componentInstance.loadError.subscribe(errors);
    await fixture.componentInstance.load(root);
    expect(errors).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.hasError(root)).toBe(true);
    await fixture.componentInstance.load(root);
    expect(fixture.componentInstance.hasError(root)).toBe(false);
    expect(fixture.componentInstance.resolvedNodes()[0].hasChildren).toBe(false);
  });
  it('loads a lazy branch through its expansion control and renders its children', async () => {
    const fixture = create();
    fixture.componentRef.setInput('nodes', [
      { value: 'remote', label: 'Remote', hasChildren: true },
    ]);
    const loader = vi.fn().mockResolvedValue([{ value: 'child', label: 'Loaded child' }]);
    fixture.componentRef.setInput('loadChildren', loader);
    fixture.detectChanges();
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    overlay.querySelector<HTMLButtonElement>('[aria-label="Expand Remote"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(overlay.textContent).toContain('Loaded child');
  });

  it('allows a new request after replacing roots with the same key and ignores old responses', async () => {
    const fixture = create();
    let resolveOld!: (nodes: TreeSelectNode[]) => void;
    let resolveNew!: (nodes: TreeSelectNode[]) => void;
    const oldRoot = { value: 'same', label: 'Old', hasChildren: true };
    const newRoot = { value: 'same', label: 'New', hasChildren: true };
    const loader = vi
      .fn()
      .mockImplementationOnce(() => new Promise<TreeSelectNode[]>((done) => (resolveOld = done)))
      .mockImplementationOnce(() => new Promise<TreeSelectNode[]>((done) => (resolveNew = done)));
    fixture.componentRef.setInput('nodes', [oldRoot]);
    fixture.componentRef.setInput('loadChildren', loader);
    fixture.detectChanges();
    const oldRequest = fixture.componentInstance.load(oldRoot);
    fixture.componentRef.setInput('nodes', [newRoot]);
    fixture.detectChanges();
    const newRequest = fixture.componentInstance.load(newRoot);
    expect(loader).toHaveBeenCalledTimes(2);
    resolveOld([{ value: 'old-child', label: 'Old child' }]);
    await oldRequest;
    expect(fixture.componentInstance.isLoading(newRoot)).toBe(true);
    resolveNew([{ value: 'new-child', label: 'New child' }]);
    await newRequest;
    expect(fixture.componentInstance.allNodes().has('old-child')).toBe(false);
    expect(fixture.componentInstance.allNodes().has('new-child')).toBe(true);
  });
  it('closes on Tab without trapping keyboard focus in the popup', async () => {
    const fixture = create();
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    overlay.querySelector('input')!.dispatchEvent(event);
    fixture.detectChanges();
    expect(fixture.componentInstance.panelOpen()).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('shows the selected leaf with a checkmark and a noninteractive indentation slot', async () => {
    const fixture = create();
    fixture.componentInstance.writeValue('design');
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.query.set('Design');
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const selected = overlay.querySelector('ngs-tree-node.ngs-option-selected')!;
    expect(selected.textContent).toContain('Design');
    expect(selected.querySelector('.ngs-tree-select-check')).not.toBeNull();
    expect(selected.querySelector('button')).toBeNull();
    expect(selected.querySelector('.ngs-tree-select-indent')).not.toBeNull();
  });
  it('opens the ancestor path of a selected leaf without filtering', async () => {
    const fixture = create();
    fixture.componentInstance.writeValue('design');
    fixture.componentInstance.open();
    fixture.detectChanges();
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    expect(overlay.querySelector('ngs-tree-node.ngs-option-selected')?.textContent).toContain(
      'Design',
    );
    expect(overlay.querySelector('[aria-label="Collapse Team"]')).not.toBeNull();
  });
});
