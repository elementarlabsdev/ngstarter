import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@ngstarter-ui/components/dialog';

@Component({
  selector: 'app-dialog-close-example',
  imports: [Button, DialogActions, DialogClose, DialogContent, DialogTitle],
  templateUrl: './dialog-close-example.html',
  styleUrl: './dialog-close-example.scss',
})
export class DialogCloseExample {
  private readonly dialog = inject(Dialog);
  private readonly closeDialog = viewChild.required<TemplateRef<unknown>>('closeDialog');

  readonly result = signal<string | null>(null);

  openDialog(): void {
    const dialogRef = this.dialog.open<unknown, unknown, string>(this.closeDialog(), {
      width: '420px',
      showCloseButton: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.result.set(result ?? 'Dialog closed without a result');
    });
  }
}
