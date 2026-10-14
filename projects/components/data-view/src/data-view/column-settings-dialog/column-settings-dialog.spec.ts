import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DIALOG_DATA, DialogRef } from '@ngstarter-ui/components/dialog';
import { MenuTrigger } from '@ngstarter-ui/components/menu';
import { DataViewColumnSettingsDialog } from './column-settings-dialog';

describe('Column settings pin menu', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('pins the actual column index from menu context, including after reorder', async () => {
    TestBed.configureTestingModule({ imports: [DataViewColumnSettingsDialog], providers: [
      { provide: DIALOG_DATA, useValue: { columns: [{ field: 'a', name: 'A' }, { field: 'b', name: 'B' }] } },
      { provide: DialogRef, useValue: { close: () => {} } }
    ] });
    const f = TestBed.createComponent(DataViewColumnSettingsDialog); f.autoDetectChanges(); await f.whenStable();
    f.componentInstance.drop({ previousIndex: 0, currentIndex: 1 } as any); await f.whenStable();
    f.debugElement.queryAll(By.directive(MenuTrigger))[0].injector.get(MenuTrigger).openMenu(); await f.whenStable();
    const button = [...document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-container button')].find(b => b.textContent?.trim() === 'Pin Right')!;
    button.click(); await f.whenStable();
    expect(f.componentInstance.columns()[0]).toMatchObject({ field: 'b', pinned: true, pinAlign: 'end' });
    expect(f.componentInstance.columns()[1].pinned).toBeUndefined();
  });
});
