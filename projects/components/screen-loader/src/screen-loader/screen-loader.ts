import { booleanAttribute, Component, input, TemplateRef } from '@angular/core';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-screen-loader',
  exportAs: 'ngsScreenLoader',
  imports: [
    ProgressBar,
    NgTemplateOutlet
  ],
  templateUrl: './screen-loader.html',
  styleUrl: './screen-loader.scss',
  host: {
    'class': 'ngs-screen-loader not-prose',
    '[class.is-opened]': 'opened()'
  }
})
export class ScreenLoader {
  opened = input(false, {
    transform: booleanAttribute
  });

  message = input<string | TemplateRef<any> | null>(null);

  protected isTemplateRef(value: any): value is TemplateRef<any> {
    return value instanceof TemplateRef;
  }
}
