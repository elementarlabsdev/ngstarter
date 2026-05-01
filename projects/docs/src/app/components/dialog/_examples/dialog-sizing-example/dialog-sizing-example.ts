import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Dialog } from '@ngstarter/components/dialog';
import { BasicDialog } from '../basic/basic.dialog';

@Component({
  selector: 'app-dialog-sizing-example',
  imports: [Button],
  templateUrl: './dialog-sizing-example.html',
  styleUrl: './dialog-sizing-example.scss',
})
export class DialogSizingExample {
  constructor(public dialog: Dialog) {}

  openDialogWithHeight(): void {
    this.dialog.open(BasicDialog, {
      height: '400px',
      width: '400px',
      minWidth: '400px',
      data: { name: 'Fixed Height', animal: 'Cat' },
    });
  }

  openDialogWithMinHeight(): void {
    this.dialog.open(BasicDialog, {
      minHeight: '600px',
      width: '700px',
      maxWidth: '700px',
      minWidth: '400px',
      data: { name: 'Min Height', animal: 'Dog' },
    });
  }
}
