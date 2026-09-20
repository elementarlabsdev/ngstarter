import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar, AvatarGroup } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-grouped-avatars-example',
  templateUrl: './grouped-avatars-example.html',
  imports: [
    Avatar,
    AvatarGroup
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './grouped-avatars-example.scss'
})
export class GroupedAvatarsExample {

}
