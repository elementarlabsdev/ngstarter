import { Component } from '@angular/core';

@Component({
  selector: 'ngs-badge-content',
  template: `{{ content }}`,
  styleUrl: './badge.scss',
})
export class BadgeContent {
  content: any;
}
