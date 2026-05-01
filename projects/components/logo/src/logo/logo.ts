import { Component } from '@angular/core';

@Component({
  selector: 'ngs-logo,[ngs-logo]',
  exportAs: 'ngsLogo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  host: {
    'class': 'ngs-logo',
  }
})
export class Logo {

}
