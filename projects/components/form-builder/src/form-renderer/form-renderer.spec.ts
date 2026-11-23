import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FieldTree } from '@angular/forms/signals';
import { FormRenderer } from './form-renderer';
import { FormBuilderSchema } from '../types';

@Component({
  imports: [FormRenderer],
  template: `
    <ngs-form-renderer [schema]="schema" [(value)]="values"
      (formReady)="tree = $event" (formSubmit)="submitted = $event"/>
  `,
})
class Host {
  readonly schema: FormBuilderSchema = {
    fields: [
      { id: 'title', name: 'title', type: 'text', label: 'Title', required: true },
      {
        id: 'lines', name: 'lines', type: 'repeater', label: 'Lines',
        children: [
          { id: 'price', name: 'price', type: 'number', label: 'Price', defaultValue: 2 },
        ],
      },
      {
        id: 'total', name: 'total', type: 'calculated', label: 'Total',
        settings: { expression: 'SUM(lines.price)', valueType: 'number' },
      },
    ],
    sections: [],
  };
  readonly values = signal<Record<string, unknown>>({});
  tree?: FieldTree<Record<string, any>>;
  submitted?: Record<string, unknown>;
}

describe('Signal Form renderer', () => {
  it('keeps explicit nulls and defaults only missing values, including in repeater rows', async () => {
    const fixture = TestBed.createComponent(FormRenderer);
    fixture.componentRef.setInput('schema', {
      fields: [
        { id: 'amount', name: 'amount', type: 'number', label: 'Amount', defaultValue: 10 },
        {
          id: 'lines', name: 'lines', type: 'repeater', label: 'Lines',
          children: [{ id: 'price', name: 'price', type: 'number', label: 'Price', defaultValue: 2 }],
        },
      ],
      sections: [],
    } satisfies FormBuilderSchema);
    fixture.componentRef.setInput('value', { amount: null, lines: [{ price: null }, {}] });
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    fixture.componentInstance.submit();
    expect(submitted).toHaveBeenCalledOnce();
    expect(submitted.mock.calls[0][0]).toMatchObject({ amount: null, lines: [{ price: null }, { price: 2 }] });
  });

  it('keeps the unrounded result for a precision outside the supported range', async () => {
    const fixture = TestBed.createComponent(FormRenderer);
    fixture.componentRef.setInput('schema', {
      fields: [{
        id: 'total', name: 'total', type: 'calculated', label: 'Total',
        settings: { expression: '12.345', valueType: 'number', precision: 101 },
      }],
      sections: [],
    } satisfies FormBuilderSchema);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()['total']).toBe(12.345);
  });

  it('waits for a logo file to be read before allowing submission without an upload callback', async () => {
    const fixture = TestBed.createComponent(FormRenderer);
    fixture.componentRef.setInput('schema', {
      fields: [{ id: 'logo', name: 'logo', type: 'logo-upload', label: 'Logo' }],
      sections: [],
    } satisfies FormBuilderSchema);
    fixture.componentRef.setInput('value', { logo: 'old-logo' });
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    fixture.nativeElement.querySelector('ngs-upload-area').dispatchEvent(new DragEvent('drop', { dataTransfer }));
    fixture.componentInstance.submit();
    expect(submitted).not.toHaveBeenCalled();

    await expect.poll(() => fixture.componentInstance.value()['logo']).toEqual(file);
    fixture.componentInstance.submit();
    expect(submitted).toHaveBeenCalledWith({ logo: file });
  });

  it('keeps one field tree while editing, calculates repeater totals, and validates submission', async () => {
    const fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const tree = host.tree!;
    const root: HTMLElement = fixture.nativeElement;
    const title = root.querySelector('input')!;
    const button = (text: string) =>
      Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === text)!;

    expect(host.values()).toMatchObject({ lines: [{ price: 2 }], total: 2 });
    button('Submit').click();
    expect(host.submitted).toBeUndefined();
    expect(tree['title']!().touched()).toBe(true);

    title.value = 'Invoice';
    title.dispatchEvent(new Event('input', { bubbles: true }));
    button('Add Item').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.tree).toBe(tree);
    expect(host.values()).toMatchObject({ title: 'Invoice', lines: [{ price: 2 }, { price: 2 }], total: 4 });

    button('Submit').click();
    expect(host.submitted).toEqual(host.values());
  });

  it('blocks submission when a readonly calculation fails', async () => {
    const fixture = TestBed.createComponent(FormRenderer);
    fixture.componentRef.setInput('schema', {
      fields: [{
        id: 'total', name: 'total', type: 'calculated', label: 'Total',
        settings: { expression: 'MISSING_FUNCTION(2)', valueType: 'number' },
      }],
      sections: [],
    } satisfies FormBuilderSchema);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    fixture.componentInstance.submit();

    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Unknown function');
  });

  it('validates required fields only while their section is visible', async () => {
    const fixture = TestBed.createComponent(FormRenderer);
    fixture.componentRef.setInput('schema', {
      fields: [{ id: 'business', name: 'business', type: 'checkbox', label: 'Business account' }],
      sections: [{
        id: 'company', title: 'Company information', fields: [
          { id: 'taxId', name: 'taxId', type: 'text', label: 'Tax ID', required: true },
        ],
      }],
      logic: [{
        id: 'hide-company',
        when: { type: 'field', fieldId: 'business', operator: 'equals', value: false },
        actions: [{ type: 'hide', targetKind: 'section', targetId: 'company' }],
      }],
    } satisfies FormBuilderSchema);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    expect(fixture.nativeElement.textContent).not.toContain('Tax ID');
    fixture.componentInstance.submit();
    expect(submitted).toHaveBeenCalledOnce();

    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Tax ID');
    fixture.componentInstance.submit();
    expect(submitted).toHaveBeenCalledOnce();
  });
});
