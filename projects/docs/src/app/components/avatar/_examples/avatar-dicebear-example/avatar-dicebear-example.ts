import { Component } from '@angular/core';
import { AvatarGroup, Dicebear } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-dicebear-example',
  imports: [
    Dicebear,
    AvatarGroup
  ],
  templateUrl: './avatar-dicebear-example.html',
  styleUrl: './avatar-dicebear-example.scss'
})
export class AvatarDicebearExample {
}
