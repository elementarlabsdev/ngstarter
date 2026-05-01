import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DialogActions,
  DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { BlockLoader } from '@ngstarter/components/block-loader';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-block-loader-modal',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    BlockLoader
  ],
  templateUrl: './block-loader-modal.html',
  styleUrl: './block-loader-modal.scss'
})
export class BlockLoaderModal implements OnInit {
  private dialogRef = inject(DialogRef<BlockLoaderModal>);

  readonly loaded = signal(false);
  readonly saving = signal(false);

  ngOnInit() {
    // loading data
    setTimeout(() => {
      this.loaded.set(true);
    }, 3000);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.saving.set(true);
    this.loaded.set(false);

    setTimeout(() => {
      this.dialogRef.close();
    }, 3000);
  }
}
