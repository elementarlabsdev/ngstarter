import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

@Component({
  selector: 'ngs-card-image, [ngs-card-image], [ngsCardImage]',
  standalone: true,
  templateUrl: './card-image.html',
  styleUrl: './card-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-card-image'
  }
})
export class CardImage {}

@Directive({
  selector: '[ngs-card-sm-image], [ngsCardImageSmall]',
  standalone: true,
  host: {
    'class': 'ngs-card-image ngs-card-sm-image'
  }
})
export class CardImageSmall {}

@Directive({
  selector: '[ngs-card-md-image], [ngsCardImageMedium]',
  standalone: true,
  host: {
    'class': 'ngs-card-image ngs-card-md-image'
  }
})
export class CardImageMedium {}

@Directive({
  selector: '[ngs-card-lg-image], [ngsCardImageLarge]',
  standalone: true,
  host: {
    'class': 'ngs-card-image ngs-card-lg-image'
  }
})
export class CardImageLarge {}

@Directive({
  selector: '[ngs-card-xl-image], [ngsCardImageXLarge]',
  standalone: true,
  host: {
    'class': 'ngs-card-image ngs-card-xl-image'
  }
})
export class CardImageXLarge {}
