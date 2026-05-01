import {
  booleanAttribute,
  Component, effect,
  ElementRef,
  inject,
  input,
  output,
  Renderer2
} from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { AnnouncementLinkTo, AnnouncementVariant } from '../types';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-announcement',
  exportAs: 'ngsAnnouncement',
  imports: [
    Icon,
    Button
  ],
  templateUrl: './announcement.html',
  styleUrl: './announcement.scss',
  host: {
    'class': 'ngs-announcement',
  }
})
export class Announcement {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);

  title = input('');
  variant = input<AnnouncementVariant>('neutral');
  iconName = input('');
  closable = input(false, {
    transform: booleanAttribute
  });
  linkTo = input<AnnouncementLinkTo | null | undefined>(null);

  readonly closed = output<void>();

  constructor() {
    effect(() => {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'data-variant', this.variant() || 'neutral');
    });
  }

  protected close() {
    this.closed.emit();
  }
}
