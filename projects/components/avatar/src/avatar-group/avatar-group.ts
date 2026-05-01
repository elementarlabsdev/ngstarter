import { Component } from '@angular/core';

@Component({
  selector: 'ngs-avatar-group',
  exportAs: 'ngsAvatarGroup',
  standalone: true,
  templateUrl: './avatar-group.html',
  styleUrl: './avatar-group.scss',
  host: {
    'class': 'ngs-avatar-group'
  }
})
export class AvatarGroup {
}
