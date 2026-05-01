import { Component } from '@angular/core';
import { DialogActions, DialogClose, DialogContent, DialogTitle } from '@ngstarter/components/dialog';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-dialog-scrollable-content',
  imports: [
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogClose
  ],
  templateUrl: './dialog-scrollable-content.dialog.html',
  styleUrl: './dialog-scrollable-content.dialog.scss'
})
export class DialogScrollableContentDialog {

}
