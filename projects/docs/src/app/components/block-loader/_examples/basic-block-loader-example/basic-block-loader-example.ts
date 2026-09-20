import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { BlockLoader, BlockLoaderContainerDirective } from '@ngstarter-ui/components/block-loader';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-block-loader-example',
  imports: [
    BlockLoader,
    Button,
    BlockLoaderContainerDirective
  ],
  templateUrl: './basic-block-loader-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-block-loader-example.scss'
})
export class BasicBlockLoaderExample {
  loading = signal(true);

  toggleLoading() {
    this.loading.set(!this.loading());
  }
}
