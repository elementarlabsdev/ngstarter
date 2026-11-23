import { TestBed } from '@angular/core/testing';
import { UploadArea } from './upload-area';

describe('UploadArea drop', () => {
  it('accepts files without an accept mask and emits only one in single-file mode', () => {
    const fixture = TestBed.createComponent(UploadArea);
    fixture.detectChanges();
    const selected = vi.fn();
    fixture.componentInstance.fileSelected.subscribe(selected);
    const dataTransfer = new DataTransfer();
    const first = new File(['first'], 'first.txt', { type: 'text/plain' });
    dataTransfer.items.add(first);
    dataTransfer.items.add(new File(['second'], 'second.txt', { type: 'text/plain' }));
    fixture.nativeElement.dispatchEvent(new DragEvent('drop', { dataTransfer }));

    expect(selected).toHaveBeenCalledOnce();
    const [{ files, fileList, multiple }] = selected.mock.calls[0];
    expect(files).toEqual([first]);
    expect(Array.from(fileList)).toEqual([first]);
    expect(multiple).toBe(false);
  });
});
