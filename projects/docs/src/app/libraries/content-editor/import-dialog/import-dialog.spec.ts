import { TestBed } from '@angular/core/testing';
import { DialogRef } from '@ngstarter-ui/components/dialog';
import { UploadFileSelectedEvent } from '@ngstarter-ui/components/upload';
import { ContentImportDialog } from './import-dialog';

function fileEvent(file: File): UploadFileSelectedEvent {
  return { files: [file], fileList: null!, multiple: false, event: new Event('change') };
}

describe('Content Editor import dialog', () => {
  const close = vi.fn();
  beforeEach(() => { close.mockClear(); TestBed.configureTestingModule({ imports: [ContentImportDialog], providers: [{ provide: DialogRef, useValue: { close } }] }); });
  afterEach(() => TestBed.resetTestingModule());

  it('reads a JSON file without uploading it, validates it and returns a native document', async () => {
    const fixture = TestBed.createComponent(ContentImportDialog);
    fixture.autoDetectChanges(); await fixture.whenStable();
    const source = JSON.stringify({ version: 1, blocks: [{ id: 'external', type: 'paragraph', content: [{ type: 'text', text: 'From file', marks: [] }] }] });
    await fixture.componentInstance.readFile(fileEvent(new File([source], 'document.json', { type: 'application/json' })));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('textarea').value).toBe(source);
    expect(fixture.componentInstance.format()).toBe('json');
    expect(fixture.componentInstance.reading()).toBe(false);
    fixture.componentInstance.import();
    expect(close).toHaveBeenCalledWith(JSON.parse(source));
  });

  it('detects HTML files, converts markup, and keeps the dialog open on invalid JSON', async () => {
    const fixture = TestBed.createComponent(ContentImportDialog);
    fixture.autoDetectChanges(); await fixture.whenStable();
    await fixture.componentInstance.readFile(fileEvent(new File(['<h2>From HTML</h2>'], 'document.html', { type: 'text/html' })));
    expect(fixture.componentInstance.format()).toBe('html');
    fixture.componentInstance.import();
    expect(close.mock.calls[0][0].blocks[0].type).toBe('heading');
    close.mockClear();
    fixture.componentInstance.changeFormat('json'); fixture.componentInstance.changeSource('{"version":2,"blocks":[]}');
    fixture.componentInstance.import();
    expect(close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('$.version');
    fixture.componentInstance.changeSource('{}');
    expect(fixture.componentInstance.error()).toBe('');
  });

  it('reports file read errors without closing the dialog', async () => {
    const fixture = TestBed.createComponent(ContentImportDialog);
    const file = new File([], 'broken.json');
    vi.spyOn(file, 'text').mockRejectedValue(new Error('Read failed'));
    await fixture.componentInstance.readFile(fileEvent(file));
    expect(fixture.componentInstance.reading()).toBe(false);
    expect(fixture.componentInstance.error()).toBe('Could not read this file.');
    expect(close).not.toHaveBeenCalled();
  });
});
