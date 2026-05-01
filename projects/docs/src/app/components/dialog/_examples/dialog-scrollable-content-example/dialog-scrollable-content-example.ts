import { Component } from '@angular/core';
import { DialogScrollableContentDialog } from '../dialog-scrollable-content/dialog-scrollable-content.dialog';
import { Button } from '@ngstarter/components/button';
import { Dialog } from '@ngstarter/components/dialog';

@Component({
  selector: 'app-dialog-scrollable-content-example',
  imports: [
    Button
  ],
  templateUrl: './dialog-scrollable-content-example.html',
  styleUrl: './dialog-scrollable-content-example.scss'
})
export class DialogScrollableContentExample {
  constructor(public dialog: Dialog) {}

  openDialog(): void {
    this.dialog.open(DialogScrollableContentDialog);
  }
}
