import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';

@Component({
  selector: 'app-avatar-variants-example',
  standalone: true,
  imports: [
    Avatar
  ],
  templateUrl: './avatar-variants-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './avatar-variants-example.scss'
})
export class AvatarVariantsExample {

}
