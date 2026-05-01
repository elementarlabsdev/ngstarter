import { Component, signal } from '@angular/core';
import { BlockLoader, BlockLoaderContainerDirective } from '@ngstarter/components/block-loader';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-basic-block-loader-example',
  imports: [
    BlockLoader,
    Button,
    BlockLoaderContainerDirective
  ],
  templateUrl: './basic-block-loader-example.html',
  styleUrl: './basic-block-loader-example.scss'
})
export class BasicBlockLoaderExample {
  loading = signal(true);

  toggleLoading() {
    this.loading.set(!this.loading());
  }
}
