import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FORM_BUILDER_FIELDS } from '../config';
import { FormBuilderSchema } from '../types';
import { FormBuilder } from './form-builder';

describe('FormBuilder', () => {
  it('renders built-in fields on the canvas without null text input warnings', async () => {
    const schema: FormBuilderSchema = {
      sections: [],
      fields: DEFAULT_FORM_BUILDER_FIELDS.map(item => ({
        id: item.type,
        name: item.type.replaceAll('-', '_'),
        type: item.type,
        kind: item.kind,
        label: item.label,
        ...item.defaults,
      })),
    };

    TestBed.configureTestingModule({ providers: [provideNativeDateAdapter()] });
    const fixture = TestBed.createComponent(FormBuilder);
    fixture.componentRef.setInput('schema', schema);
    const warn = vi.spyOn(console, 'warn');

    try {
      fixture.detectChanges();
      await fixture.whenStable();

      const canvas: HTMLElement = fixture.nativeElement.querySelector('.ngs-form-builder-canvas');
      expect(canvas.querySelectorAll('[data-form-builder-field-id]')).toHaveLength(schema.fields!.length);
      expect(warn.mock.calls.some(([message]) => String(message).includes('NG01921'))).toBe(false);
    } finally {
      warn.mockRestore();
    }
  });
});
