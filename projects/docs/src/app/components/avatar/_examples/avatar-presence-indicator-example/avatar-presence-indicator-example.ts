import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-presence-indicator-example',
  templateUrl: './avatar-presence-indicator-example.html',
  imports: [
    Avatar
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './avatar-presence-indicator-example.scss'
})
export class AvatarPresenceIndicatorExample {

}
