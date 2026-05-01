import { Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { BlockLoaderModal } from '../_modals/block-loader-modal/block-loader-modal';

@Component({
  selector: 'app-block-loader-in-modal-example',
  imports: [
    Button
  ],
  templateUrl: './block-loader-in-modal-example.html',
  styleUrl: './block-loader-in-modal-example.scss'
})
export class BlockLoaderInModalExample {
  private dialog = inject(Dialog);

  showDialog() {
    this.dialog.open(BlockLoaderModal);
  }
}
