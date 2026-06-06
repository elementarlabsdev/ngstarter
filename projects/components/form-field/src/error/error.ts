import { Component } from '@angular/core';

@Component({
  selector: 'ngs-error',
  exportAs: 'ngsError',
  templateUrl: './error.html',
  styleUrl: './error.scss',
  host: {
    'class': 'ngs-error',
    'role': 'alert',
  }
})
export class Error {}
