import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'ngs-comment-editor-link-dialog',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Label,
    Input
  ],
  templateUrl: './link.dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDialog {
  private readonly dialogRef = inject(DialogRef);
  private readonly data = inject<{ linkUrl?: string }>(DIALOG_DATA);

  linkUrl = this.data.linkUrl ?? '';
  readonly isUpdate = !!this.data.linkUrl;

  submit(): void {
    this.dialogRef.close(this.linkUrl.trim());
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
