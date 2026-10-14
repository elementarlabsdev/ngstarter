import { userEvent } from 'vitest/browser';
import { TestBed } from '@angular/core/testing';
import { DataView } from './data-view';

async function create(options: Record<string, unknown> = {}, configure = true) {
  if (configure) TestBed.configureTestingModule({ imports: [DataView] });
  const fixture = TestBed.createComponent(DataView<{ id: number; name: string }>);
  fixture.componentRef.setInput('columnDefs', [{ field: 'name', name: 'Name', sortable: true }]);
  fixture.componentRef.setInput('data', Array.from({ length: 30 }, (_, id) => ({ id, name: `Row ${id}` })));
  for (const [key, value] of Object.entries(options)) fixture.componentRef.setInput(key, value);
  fixture.autoDetectChanges(); await fixture.whenStable(); return fixture;
}

describe('DataView query correctness', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('resets a later page on search and clamps it after records shrink', async () => {
    const f = await create({ withPagination: true, pageIndex: 2 });
    expect(f.componentInstance.pageIndex()).toBe(2);
    f.componentInstance.api.search('Row 29'); await f.whenStable();
    expect(f.componentInstance.pageIndex()).toBe(0);
    f.componentInstance.api.search(''); await f.whenStable();
    f.componentInstance.pageIndex.set(2); await f.whenStable();
    f.componentRef.setInput('data', [{ id: 1, name: 'Only row' }]); await f.whenStable();
    expect(f.componentInstance.pageIndex()).toBe(0);
  });
  it('routes API search to the server datasource with the same query as input search', async () => {
    const requests: any[] = [];
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: (p: any) => { requests.push(p); p.successCallback([], 0); } } });
    f.componentInstance.api.search('Needle'); await f.whenStable();
    await expect.poll(() => requests.at(-1)?.filterModel).toBe('Needle');
    expect(f.componentInstance.search()).toBe('Needle');
  });
});

describe('DataView selection scopes', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('selects filtered results without hidden rows and preserves IDs on reload', async () => {
    const f = await create({ getRowId: (r: any) => r.id, withSelection: true });
    f.componentInstance.api.search('Row 29'); await f.whenStable(); f.componentInstance.selectAll();
    expect(f.componentInstance.getSelection().rowIds).toEqual([29]);
    const next = Array.from({ length: 30 }, (_, id) => ({ id, name: `Updated ${id}` }));
    f.componentRef.setInput('data', next); await f.whenStable();
    expect(f.componentInstance.isSelected(next[29])).toBe(true);
    expect(f.componentInstance.getSelection().rows).toEqual([next[29]]);
  });
  it('limits page selection and correctly evaluates the current header checkbox', async () => {
    const f = await create({ getRowId: (r: any) => r.id, withPagination: true, selectionScope: 'page', pageIndex: 1 });
    f.componentInstance.selectAll(); expect(f.componentInstance.getSelection().rowIds).toEqual([10,11,12,13,14,15,16,17,18,19]);
    expect(f.componentInstance.isAllSelected()).toBe(true);
    f.componentInstance.pageIndex.set(2); await f.whenStable(); expect(f.componentInstance.isAllSelected()).toBe(false);
  });
  it('represents server-wide selection and clears filtered all-matching selection when query changes', async () => {
    const f = await create({ rowModelType: 'serverSide', getRowId: (r: any) => r.id, datasource: { getItems: (p: any) => p.successCallback([{ id: 1, name: 'Server' }], 1000) } });
    f.componentInstance.selectAll('filtered'); expect(f.componentInstance.getSelection().allMatching).toBe(true);
    expect(f.componentInstance.isSelected({ id: 999, name: 'Unloaded' })).toBe(true);
    f.componentInstance.rowSelectionToggle({ checked: false } as any, { id: 1, name: 'Server' });
    expect(f.componentInstance.getSelection().excludedRowIds).toEqual([1]);
    f.componentInstance.api.search('Different'); await f.whenStable(); expect(f.componentInstance.hasSelected()).toBe(false);
  });
});

describe('DataView server lifecycle', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('aborts replaced requests, ignores stale replies, and renders errors with Retry', async () => {
    const requests: any[] = []; const cleanup = vi.fn();
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: (p: any) => { requests.push(p); return cleanup; } } });
    const old = requests.at(-1); f.componentInstance.pageIndex.set(1); await f.whenStable();
    expect(old.signal.aborted).toBe(true); expect(cleanup).toHaveBeenCalled();
    old.successCallback([{ id: 1, name: 'Stale' }], 100); expect(f.nativeElement.textContent).not.toContain('Stale');
    requests.at(-1).failCallback(new Error('Offline')); await f.whenStable();
    expect(f.componentInstance.loadStatus()).toBe('error'); expect(f.nativeElement.textContent).toContain('Offline');
    [...f.nativeElement.querySelectorAll('button')].find((b: any) => b.textContent.trim() === 'Retry').click(); await f.whenStable();
    expect(f.componentInstance.error()).toBeNull();
    requests.at(-1).successCallback([{ id: 2, name: 'Restored' }], 100); await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Restored');
  });
  it('keeps records visible during refresh and cleans up on destroy', async () => {
    const requests: any[] = [];
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: (p: any) => requests.push(p) } });
    requests.at(-1).successCallback([{ id: 2, name: 'Visible row' }], 1); await f.whenStable();
    f.componentInstance.refresh(); await f.whenStable();
    expect(f.componentInstance.refreshing()).toBe(true); expect(f.nativeElement.textContent).toContain('Visible row');
    const pending = requests.at(-1); f.destroy(); expect(pending.signal.aborted).toBe(true);
  });
  it('captures synchronous datasource failures', async () => {
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: () => { throw new Error('Sync failure'); } } });
    expect(f.componentInstance.error()).toBe('Sync failure');
  });
});

describe('DataView column filtering', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('combines column filters with quick search and resets the page', async () => {
    const f = await create({ withPagination: true, pageIndex: 2 });
    f.componentRef.setInput('columnDefs', [{ field: 'name', name: 'Name', filter: { type: 'text' } }]); await f.whenStable();
    f.componentInstance.setColumnFilter('name', { type: 'text', operator: 'endsWith', value: '9' }); await f.whenStable();
    expect(f.componentInstance.pageIndex()).toBe(0);
    f.componentInstance.selectAll(); expect(f.componentInstance.getSelection().rows.map(r => r.id)).toEqual([9,19,29]);
    f.componentInstance.api.search('Row 29'); await f.whenStable();
    f.componentInstance.unselectAll(); f.componentInstance.selectAll(); expect(f.componentInstance.getSelection().rows.map(r => r.id)).toEqual([29]);
    f.componentInstance.clearFilters(); await f.whenStable(); expect(f.componentInstance.columnFilters()).toEqual({});
  });
  it('passes the exact serialized column filter model to server datasources', async () => {
    const requests: any[] = [];
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: (p: any) => { requests.push(p); p.successCallback([], 0); } } });
    const filter = { type: 'text' as const, operator: 'startsWith' as const, value: 'Row' };
    f.componentInstance.setColumnFilter('name', filter); await f.whenStable(); expect(requests.at(-1).columnFilters).toEqual({ name: filter });
  });
});

describe('DataView saved views', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('restores column order, visibility, width, pinning, sort, filters and page size', async () => {
    const f = await create({ withSavedViews: true, columnDefs: [{ field: 'id', name: 'ID' }, { field: 'name', name: 'Name', filter: { type: 'text' } }] });
    const state = { ...f.componentInstance.getState(), columns: [{ field: 'name', visible: true, width: 222, pinned: true, pinAlign: 'end' as const }, { field: 'id', visible: false }], sort: { active: 'name', direction: 'desc' as const }, pageSize: 20 };
    f.componentInstance.setState(state); f.componentInstance.setColumnFilter('name', { type: 'text', operator: 'endsWith', value: '9' }); await f.whenStable();
    const saved = f.componentInstance.saveView('Nines'); f.componentInstance.clearFilters(); f.componentInstance.applyView(null); await f.whenStable();
    f.componentInstance.applyView(saved.id); await f.whenStable();
    expect(f.componentInstance.getSnapshot()).toEqual([{ field: 'name', visible: true, width: '222px', pinned: true, pinAlign: 'end' }, { field: 'id', visible: false, width: undefined, pinned: false, pinAlign: undefined }]);
    expect(f.componentInstance.sortState().direction).toBe('desc'); expect(f.componentInstance.pageSize()).toBe(20);
    expect(f.componentInstance.columnFilters()['name']).toMatchObject({ value: '9' });
    f.componentInstance.renameView(saved.id, 'Renamed'); expect(f.componentInstance.savedViews()[0].name).toBe('Renamed');
    f.componentInstance.deleteView(saved.id); expect(f.componentInstance.savedViews()).toEqual([]);
  });
  it('persists named views through an injectable storage and restores the active query', async () => {
    const storage = new Map<string,string>();
    TestBed.configureTestingModule({ providers: [{ provide: (await import('../config')).DATA_VIEW_CONFIG, useValue: { viewStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } } }] });
    const first = await create({ viewStorageKey: 'test-view' }); first.componentInstance.api.search('Row 29'); await first.whenStable();
    first.componentInstance.saveView('Last'); await first.whenStable(); first.destroy();
    const next = await create({ viewStorageKey: 'test-view' }, false); await next.whenStable();
    expect(next.componentInstance.search()).toBe('Row 29'); expect(next.componentInstance.savedViews()[0].name).toBe('Last');
  });
});

describe('DataView accessible grid workflows', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('navigates virtual rows, extends selection, and owns pinned cells as one logical row', async () => {
    const rows = Array.from({ length: 1000 }, (_, id) => ({ id, name: `Record ${id}` }));
    const f = await create({ data: rows, getRowId: (r: any) => r.id, withSelection: true, ariaLabel: 'Records', columnDefs: [
      { field: 'id', name: 'ID', width: 100, pinned: true }, { field: 'name', name: 'Name', width: 300 }
    ] });
    const viewport = f.nativeElement.querySelector('.grid-body-center') as HTMLElement;
    viewport.style.position = 'relative'; viewport.style.height = '240px'; viewport.style.width = '600px';
    await f.whenStable();
    const root = f.nativeElement.querySelector('[role="grid"]') as HTMLElement; root.focus();
    await userEvent.keyboard('{ArrowDown}'); await userEvent.keyboard(' '); await f.whenStable();
    expect(f.componentInstance.getSelection().rowIds).toEqual([1]);
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}'); await f.whenStable();
    expect(f.componentInstance.getSelection().rowIds).toEqual([1,2]);
    expect(root.querySelector('input[type="checkbox"]')?.getAttribute('aria-label')).toBe('Select rows in current selection scope');
    expect(root.querySelector('input[aria-label="Select row 1"]')).toBeTruthy();
    expect(root.getAttribute('aria-rowcount')).toBe('1001'); expect(root.getAttribute('aria-colcount')).toBe('3');
    const row = root.querySelector('[role="row"][aria-rowindex="4"]')!;
    const owned = row.getAttribute('aria-owns')!.split(' ');
    expect(owned).toHaveLength(3); expect(owned.every(id => !!document.getElementById(id))).toBe(true);
    await userEvent.keyboard('{Control>}{End}{/Control}'); await f.whenStable();
    const activeId = root.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)?.getAttribute('aria-colindex')).toBe('3');
    expect(document.getElementById(activeId)?.closest('[role="row"]')?.getAttribute('aria-rowindex')).toBe('1001');
    expect(root.querySelectorAll('[role="row"]').length).toBeLessThan(1000);
  });
  it('resizes headers using a labelled keyboard separator and clamps to column limits', async () => {
    const f = await create({ columnDefs: [{ field: 'name', name: 'Name', width: 100, minWidth: 60, maxWidth: 120, resizable: true }] });
    const handle = f.nativeElement.querySelector('[role="separator"]') as HTMLElement; handle.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}'); await f.whenStable();
    expect(f.componentInstance.getSnapshot()[0].width).toBe('120px');
    await userEvent.keyboard('{Home}'); await f.whenStable(); expect(f.componentInstance.getSnapshot()[0].width).toBe('60px');
    expect(handle.getAttribute('aria-label')).toBe('Resize Name');
  });
  it('opens a real filter dialog, applies its field, then removes the active chip', async () => {
    const f = await create({ columnDefs: [{ field: 'name', name: 'Name', filter: { type: 'text' } }] });
    (f.nativeElement.querySelector('button[aria-label="Filter Name"]') as HTMLButtonElement).click(); await f.whenStable();
    const dialog = document.querySelector('ngs-data-view-column-filter-dialog')!;
    await userEvent.fill(dialog.querySelector('input')!, '29');
    [...dialog.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.trim() === 'Apply filter')!.click(); await f.whenStable();
    expect(f.componentInstance.columnFilters()['name']).toMatchObject({ value: '29' });
    (f.nativeElement.querySelector('button[aria-label^="Remove filter"]') as HTMLButtonElement).click(); await f.whenStable();
    expect(f.componentInstance.columnFilters()).toEqual({});
  });
});

describe('DataView request and mode regressions', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('keeps pending requests alive when an equivalent filter object is passed again', async () => {
    const requests: any[] = [];
    const f = await create({ rowModelType: 'serverSide', datasource: { getItems: (p: any) => { requests.push(p); } } });
    const filter = { type: 'text' as const, operator: 'contains' as const, value: 'Record' };
    f.componentInstance.setColumnFilter('name', filter); await f.whenStable(); const pending = requests.at(-1); const count = requests.length;
    f.componentInstance.setColumnFilter('name', { ...filter }); await f.whenStable();
    expect(requests.length).toBe(count); expect(pending.signal.aborted).toBe(false);
    pending.successCallback([{ id: 1, name: 'Record' }], 1); await f.whenStable(); expect(f.componentInstance.loadStatus()).toBe('ready');
  });
  it('switches row models and invalidates callbacks from the previous datasource', async () => {
    const requests: any[] = []; const datasource = { getItems: (p: any) => { requests.push(p); } };
    const f = await create(); f.componentRef.setInput('datasource', datasource); f.componentRef.setInput('rowModelType', 'serverSide'); await f.whenStable();
    const pending = requests.at(-1); expect(f.componentInstance.loadStatus()).toBe('loading');
    f.componentRef.setInput('rowModelType', 'clientSide'); await f.whenStable(); expect(pending.signal.aborted).toBe(true);
    pending.successCallback([{ id: 999, name: 'Wrong source' }], 1); await f.whenStable(); expect(f.nativeElement.textContent).not.toContain('Wrong source');
    expect(f.componentInstance.loadStatus()).toBe('ready');
  });
});

describe('DataView empty and saved-view interactions', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('keeps labelled headers and filter controls reachable when no rows match', async () => {
    const f = await create({ columnDefs: [{ field: 'name', name: 'Name', sortable: true, filter: { type: 'text' } }] });
    f.componentInstance.setColumnFilter('name', { type: 'text', operator: 'equals', value: 'Missing' }); await f.whenStable();
    expect(f.nativeElement.querySelector('[role="grid"]')).toBeTruthy();
    expect(f.nativeElement.querySelector('[role="columnheader"]')).toBeTruthy();
    expect(f.nativeElement.querySelector('button[aria-label="Filter Name"]')).toBeTruthy();
    expect(f.nativeElement.querySelector('[role="grid"]').getAttribute('aria-rowcount')).toBe('1');
    expect(f.nativeElement.querySelector('[role="grid"]').getAttribute('aria-activedescendant')).toBeNull();
  });
});

describe('DataView external pagination and named-view UI', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('synchronizes an external paginator when filters reduce results', async () => {
    const { Paginator } = await import('@ngstarter-ui/components/paginator');
    TestBed.configureTestingModule({ imports: [DataView, Paginator] });
    const paginator = TestBed.createComponent(Paginator); paginator.autoDetectChanges(); await paginator.whenStable();
    const f = await create({ withPagination: true, pageIndex: 2, paginator: paginator.componentInstance }, false);
    expect(paginator.componentInstance.length).toBe(30); expect(paginator.componentInstance.pageIndex).toBe(2);
    f.componentInstance.api.search('Row 29'); await f.whenStable();
    expect(paginator.componentInstance.length).toBe(1); expect(paginator.componentInstance.pageIndex).toBe(0);
  });
  it('saves a named view through the actual menu and dialog', async () => {
    const { By } = await import('@angular/platform-browser'); const { MenuTrigger } = await import('@ngstarter-ui/components/menu');
    const f = await create({ withSavedViews: true });
    const trigger = f.debugElement.queryAll(By.directive(MenuTrigger)).find(el => el.nativeElement.textContent.trim() === 'View actions')!;
    trigger.injector.get(MenuTrigger).openMenu(); await f.whenStable();
    [...document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-container button')].find(b => b.textContent?.trim() === 'Save current view')!.click(); await f.whenStable();
    const dialog = document.querySelector('ngs-data-view-saved-view-dialog')!; await userEvent.fill(dialog.querySelector('input')!, 'My queue');
    [...dialog.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.trim() === 'Save')!.click(); await f.whenStable();
    expect(f.componentInstance.savedViews()[0].name).toBe('My queue'); expect(f.componentInstance.activeViewId()).toBe(f.componentInstance.savedViews()[0].id);
    expect(f.nativeElement.textContent).not.toContain('Unsaved changes');
  });
});

describe('DataView view comparison', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('normalizes numeric widths and property order before marking a view dirty', async () => {
    const f = await create({ withSavedViews: true, columnDefs: [{ field: 'name', name: 'Name', width: 180 }] });
    f.componentInstance.savedViews.set([{ id: 'v', name: 'Sized', state: { version: 1,
      columns: [{ width: 180, visible: true, field: 'name' }], sort: { direction: 'asc', active: 'name' }, search: '', columnFilters: {}, pageSize: 10 } }]);
    f.componentInstance.applyView('v'); await f.whenStable();
    expect((f.componentInstance as any).dirtyView()).toBe(false);
    f.componentInstance.pageSize.set(20); await f.whenStable(); expect((f.componentInstance as any).dirtyView()).toBe(true);
  });
});
