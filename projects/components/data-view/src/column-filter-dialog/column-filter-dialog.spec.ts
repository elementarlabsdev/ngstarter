import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { DIALOG_DATA, DialogRef } from '@ngstarter-ui/components/dialog';
import { DataViewColumnFilterDialog } from './column-filter-dialog';

async function create(type: string, filter?: unknown) {
  const close = vi.fn();
  TestBed.configureTestingModule({ imports: [DataViewColumnFilterDialog], providers: [
    { provide: DIALOG_DATA, useValue: { column: { field: 'value', name: 'Value', filter: { type, options: [{ value: 1, label: 'One' }] } }, filter } },
    { provide: DialogRef, useValue: { close } }
  ] });
  const f = TestBed.createComponent(DataViewColumnFilterDialog); f.autoDetectChanges(); await f.whenStable(); return { f, close };
}
describe('DataView typed filter dialog', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('applies text entered into the actual NgStarter field', async () => {
    const { f, close } = await create('text');
    await userEvent.fill(f.nativeElement.querySelector('input'), '  Needle  '); await f.whenStable();
    [...f.nativeElement.querySelectorAll('button')].find((b: any) => b.textContent.trim() === 'Apply filter').click();
    expect(close).toHaveBeenCalledWith({ filter: { type: 'text', operator: 'contains', value: 'Needle' } });
  });
  it.each(['not a date', '02/30/2026', '13/01/2026'])('blocks invalid calendar input %s', async value => {
    const { f, close } = await create('date');
    await userEvent.fill(f.nativeElement.querySelector('input[ngsStartDate]'), value); await userEvent.tab(); await f.whenStable();
    const apply = [...f.nativeElement.querySelectorAll('button')].find((b: any) => b.textContent.trim() === 'Apply filter') as HTMLButtonElement;
    expect(apply.disabled).toBe(true); apply.click(); expect(close).not.toHaveBeenCalled();
  });
  it('restores calendar ranges and serializes valid typed dates', async () => {
    const { f, close } = await create('date', { type: 'date', from: '2026-10-01', to: '2026-10-14' });
    const start = f.nativeElement.querySelector('input[ngsStartDate]') as HTMLInputElement;
    expect(start.value).not.toBe('');
    await userEvent.fill(start, '10/02/2026'); await f.whenStable(); f.componentInstance.apply();
    expect(close).toHaveBeenCalledWith({ filter: { type: 'date', from: '2026-10-02', to: '2026-10-14' } });
  });
  it.each(['number', 'enum', 'boolean'])('renders and preserves %s filters', async type => {
    const filter = type === 'number' ? { type, operator: 'equals', value: 42 } : type === 'enum' ? { type, values: [1] } : { type, value: false };
    const { f, close } = await create(type, filter); f.componentInstance.apply(); expect(close).toHaveBeenCalledWith({ filter });
  });
});
