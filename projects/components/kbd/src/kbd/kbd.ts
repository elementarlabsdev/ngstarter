import { Component, inject } from '@angular/core';

@Component({
  selector: 'ngs-kbd',
  exportAs: 'ngsKbd',
  imports: [],
  templateUrl: './kbd.html',
  styleUrl: './kbd.scss',
  host: {
    'class': 'ngs-kbd',
  }
})
export class Kbd {
}
