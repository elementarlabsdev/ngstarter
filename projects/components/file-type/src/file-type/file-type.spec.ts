import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, beforeEach } from 'vitest';

import { FileType } from './file-type';
import { FileTypeName } from '../types';

@Component({
  imports: [FileType],
  template: `
    <ngs-file-type
      [fileName]="fileName()"
      [extension]="extension()"
      [mimeType]="mimeType()"
      [fallback]="fallback()"
      [decorative]="decorative()"
    />
  `,
})
class FileTypeHost {
  readonly fileName = signal<string | null>(null);
  readonly extension = signal<string | null>(null);
  readonly mimeType = signal<string | null>(null);
  readonly fallback = signal<FileTypeName>('txt');
  readonly decorative = signal(false);
}

describe('FileType', () => {
  let fixture: ComponentFixture<FileTypeHost>;
  let host: FileTypeHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTypeHost],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTypeHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resolves a file type from fileName extension', () => {
    host.fileName.set('quarterly-report.pdf');
    fixture.detectChanges();

    expect(fileTypeElement().dataset['fileType']).toBe('pdf');
    expect(fileTypeElement().textContent).toContain('PDF');
  });

  it('prefers an explicit extension over mime type', () => {
    host.extension.set('.csv');
    host.mimeType.set('application/pdf');
    fixture.detectChanges();

    expect(fileTypeElement().dataset['fileType']).toBe('csv');
    expect(fileTypeElement().textContent).toContain('CSV');
  });

  it('resolves known mime types and mime families', () => {
    host.mimeType.set('image/jpeg; charset=binary');
    fixture.detectChanges();

    expect(fileTypeElement().dataset['fileType']).toBe('jpg');

    host.mimeType.set('video/unknown');
    fixture.detectChanges();

    expect(fileTypeElement().dataset['fileType']).toBe('mp4');
  });

  it('uses the fallback for unknown files', () => {
    host.fileName.set('archive.custom');
    host.fallback.set('zip');
    fixture.detectChanges();

    expect(fileTypeElement().dataset['fileType']).toBe('zip');
  });

  it('can render as decorative content', () => {
    host.fileName.set('waveform.wav');
    host.decorative.set(true);
    fixture.detectChanges();

    expect(fileTypeElement().getAttribute('role')).toBeNull();
    expect(fileTypeElement().getAttribute('aria-label')).toBeNull();
    expect(fileTypeElement().getAttribute('aria-hidden')).toBe('true');
  });

  function fileTypeElement(): HTMLElement {
    return fixture.debugElement.query(By.directive(FileType)).nativeElement as HTMLElement;
  }
});
