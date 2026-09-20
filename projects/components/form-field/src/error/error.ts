import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-error',
  exportAs: 'ngsError',
  templateUrl: './error.html',
  styleUrl: './error.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-error',
    'role': 'alert',
  }
})
export class Error {}
