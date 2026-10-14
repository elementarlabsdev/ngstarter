import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentEditorConfig, ContentEditorDocument, ContentEditorImporter } from '@ngstarter-ui/components/content-editor';
import { DIALOG_DATA, DialogTitle, DialogContent, DialogActions, DialogClose, DialogRef } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Segmented, SegmentedButton } from '@ngstarter-ui/components/segmented';
import { Alert } from '@ngstarter-ui/components/alert';
import { UploadTriggerDirective, UploadFileSelectedEvent } from '@ngstarter-ui/components/upload';

export interface ContentImportResult { document: ContentEditorDocument; mode: 'replace' | 'insert'; }

@Component({
  imports: [DialogTitle, DialogContent, DialogActions, DialogClose, Button, FormField, Label, Input, Segmented, SegmentedButton, Alert, UploadTriggerDirective],
  templateUrl: './import-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentImportDialog {
  private readonly data = inject<{ config?: ContentEditorConfig }>(DIALOG_DATA, { optional: true });
  private readonly importer = inject(ContentEditorImporter);
  private readonly ref = inject<DialogRef<ContentImportDialog, ContentImportResult>>(DialogRef);
  readonly mode = signal<'replace' | 'insert'>('replace');
  readonly format = signal<'json' | 'html'>('json');
  readonly source = signal('');
  readonly error = signal('');
  readonly reading = signal(false);

  changeSource(value: string): void { this.source.set(value); this.error.set(''); }
  changeFormat(value: 'json' | 'html'): void { this.format.set(value); this.error.set(''); }

  async readFile(event: UploadFileSelectedEvent): Promise<void> {
    const file = event.files[0];
    if (!file) return;
    this.reading.set(true);
    this.error.set('');
    try {
      this.source.set(await file.text());
      this.format.set(/\.html?$/i.test(file.name) || file.type === 'text/html' ? 'html' : 'json');
    } catch { this.error.set('Could not read this file.'); }
    finally { this.reading.set(false); }
  }

  import(): void {
    this.error.set('');
    try {
      const document = this.format() === 'json' ? this.importer.fromJson(this.source(), this.data?.config) : this.importer.fromHtml(this.source(), this.data?.config);
      this.ref.close({ document, mode: this.mode() });
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not import this document.'); }
  }
}
