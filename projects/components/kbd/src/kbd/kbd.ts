import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-kbd',
  exportAs: 'ngsKbd',
  imports: [],
  templateUrl: './kbd.html',
  styleUrl: './kbd.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-kbd',
  }
})
export class Kbd {
}
