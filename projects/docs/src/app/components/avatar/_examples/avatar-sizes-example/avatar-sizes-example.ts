import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-sizes-example',
  templateUrl: './avatar-sizes-example.html',
  imports: [
    Avatar
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './avatar-sizes-example.scss'
})
export class AvatarSizesExample {

}
