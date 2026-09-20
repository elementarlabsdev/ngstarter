import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-basic-avatar-example',
  templateUrl: './basic-avatar-example.html',
  imports: [
    Avatar
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-avatar-example.scss'
})
export class BasicAvatarExample {

}
