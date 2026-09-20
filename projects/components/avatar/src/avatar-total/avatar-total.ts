import { Component, ChangeDetectionStrategy } from '@angular/core';

// DEPRECATED
@Component({
  selector: 'ngs-avatar-total,[ngs-avatar-total]',
  exportAs: 'ngsAvatarTotal',
  templateUrl: './avatar-total.html',
  styleUrl: './avatar-total.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-avatar-total'
  }
})
export class AvatarTotal {
}
