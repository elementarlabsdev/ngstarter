import { Component, inject } from '@angular/core';
import { ScreenLoaderService } from '@ngstarter/components/screen-loader';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-basic-screen-loader-example',
  imports: [
    Button
  ],
  templateUrl: './basic-screen-loader-example.html',
  styleUrl: './basic-screen-loader-example.scss'
})
export class BasicScreenLoaderExample {
  private screenLoader = inject(ScreenLoaderService);

  openScreenLoader() {
    const ref = this.screenLoader.open('Please wait, a heavy task is performed on the backend.');

    ref.afterOpened().subscribe(() => {
      console.log('Screen loader opened');
    });

    ref.afterClosed().subscribe(() => {
      console.log('Screen loader closed');
    });

    setTimeout(() => {
      ref.close();
    }, 5000);
  }
}
