import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-badge-content',
  template: `{{ content }}`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './badge.scss',
})
export class BadgeContent {
  content: any;
}
