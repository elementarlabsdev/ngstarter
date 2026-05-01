import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasicDialog } from '../basic/basic.dialog';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-basic-dialog-example',
  imports: [
    FormsModule,
    Button,
    FormField,
    Label,
    Input
  ],
  templateUrl: './basic-dialog-example.html',
  styleUrl: './basic-dialog-example.scss'
})
export class BasicDialogExample {
  animal: string;
  name: string;

  constructor(public dialog: Dialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(BasicDialog, {
      width: '500px',
      data: { name: this.name, animal: this.animal },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}
