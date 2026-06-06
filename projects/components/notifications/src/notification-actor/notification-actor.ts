import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'ngs-notification-actor,[ngs-notification-actor]',
  imports: [],
  templateUrl: './notification-actor.html',
  styleUrl: './notification-actor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-notification-actor',
    '[class.as-link]': 'asLink'
  }
})
export class NotificationActor {
  private elementRef = inject(ElementRef);

  protected get asLink() {
    return (this.elementRef.nativeElement as HTMLElement).tagName === 'A';
  }
}
