import { Component } from '@angular/core';

@Component({
  selector: 'ngs-error',
  standalone: true,
  templateUrl: './error.html',
  styleUrl: './error.scss',
  host: {
    'class': 'ngs-error',
    'role': 'alert',
  }
})
export class Error {}
