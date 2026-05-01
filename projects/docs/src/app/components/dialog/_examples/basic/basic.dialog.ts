import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DIALOG_DATA,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-basic',
  imports: [
    FormsModule,
    DialogActions,
    DialogContent,
    Button,
    DialogClose,
    DialogTitle,
    Input,
    Label,
    FormField
  ],
  templateUrl: './basic.dialog.html',
  styleUrl: './basic.dialog.scss'
})
export class BasicDialog {
  constructor(
    public dialogRef: DialogRef<BasicDialog>,
    @Inject(DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
