import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-avatar-group',
  exportAs: 'ngsAvatarGroup',
  templateUrl: './avatar-group.html',
  styleUrl: './avatar-group.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-avatar-group'
  }
})
export class AvatarGroup {
}
