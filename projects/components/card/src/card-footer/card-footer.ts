import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-card-footer, [ngs-card-footer], [ngsCardFooter]',
  templateUrl: './card-footer.html',
  styleUrl: './card-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-footer'
  }
})
export class CardFooter {}
