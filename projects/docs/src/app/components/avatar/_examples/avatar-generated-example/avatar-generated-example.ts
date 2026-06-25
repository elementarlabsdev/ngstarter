import { Component } from '@angular/core';
import { AvatarGroup, Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-generated-example',
  imports: [
    Avatar,
    AvatarGroup
  ],
  templateUrl: './avatar-generated-example.html',
  styleUrl: './avatar-generated-example.scss'
})
export class AvatarGeneratedExample {
}
