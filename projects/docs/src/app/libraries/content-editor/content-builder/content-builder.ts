import { Component } from '@angular/core';
import { ContentBuilderComponent } from '@ngstarter/components/content-editor';

@Component({
  selector: 'app-content-builder',
  imports: [
    ContentBuilderComponent
  ],
  templateUrl: './content-builder.html',
  styleUrl: './content-builder.scss',
})
export class ContentBuilder {
  options = {
    image: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 2000);
        });
      }
    },
    video: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(base64);
          }, 3000);
        });
      }
    }
  };
}
