import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef, DialogTitle, DialogContent, DialogActions } from '@ngstarter-ui/components/dialog';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Button } from '@ngstarter-ui/components/button';
import { Alert } from '@ngstarter-ui/components/alert';
export interface DataViewSavedViewDialogData { name?: string; existingNames: string[]; }
@Component({
  selector: 'ngs-data-view-saved-view-dialog',
  templateUrl: './saved-view-dialog.html',
  imports: [FormsModule, DialogTitle, DialogContent, DialogActions, FormField, Label, Input, Button, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewSavedViewDialog {
  private readonly data = inject<DataViewSavedViewDialogData>(DIALOG_DATA);
  private readonly dialog = inject<DialogRef<DataViewSavedViewDialog, string>>(DialogRef);
  readonly name = signal(this.data.name ?? '');
  readonly error = signal<string | null>(null);
  readonly title = this.data.name ? 'Rename view' : 'Save view';
  save(): void {
    const name = this.name().trim();
    if (!name) { this.error.set('Enter a view name'); return; }
    if (this.data.existingNames.some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      this.error.set('A view with this name already exists'); return;
    }
    this.dialog.close(name);
  }
  cancel(): void { this.dialog.close(); }
}
