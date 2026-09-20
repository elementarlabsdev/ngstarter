import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-avatar-more,[ngs-avatar-more]',
  exportAs: 'ngsAvatarMore',
  imports: [],
  templateUrl: './avatar-more.html',
  styleUrl: './avatar-more.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-avatar-more'
  }
})
export class AvatarMore {

}
