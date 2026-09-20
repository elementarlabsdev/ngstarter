import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-with-images-example',
  templateUrl: './avatar-with-images-example.html',
  imports: [
    Avatar
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './avatar-with-images-example.scss'
})
export class AvatarWithImagesExample {

}
