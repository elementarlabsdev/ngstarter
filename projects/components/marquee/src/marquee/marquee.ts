import {
  Component,
  ElementRef,
  input,
  viewChild,
  AfterContentInit,
  inject,
  PLATFORM_ID,
  booleanAttribute,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  TemplateRef
} from '@angular/core';
import { isPlatformServer, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ngs-marquee',
  exportAs: 'ngsMarquee',
  imports: [NgTemplateOutlet],
  templateUrl: './marquee.html',
  styleUrl: './marquee.scss',
  host: {
    'class': 'ngs-marquee'
  }
})
export class Marquee implements AfterContentInit, OnChanges, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _platformId = inject(PLATFORM_ID);
  private _intersectionObserver?: IntersectionObserver;

  reverse = input(false, {
    transform: booleanAttribute
  });
  pauseOnHover = input(false, {
    transform: booleanAttribute
  });

  protected isInView = false;

  readonly template = viewChild.required(TemplateRef);

  protected get nativeElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reverse']) {
      this.nativeElement.style.setProperty('--ngs-marquee-reverse', changes['reverse'].currentValue ? 'reverse' : '');
    }

    if (changes['pauseOnHover']) {
      this.nativeElement.style.setProperty('--ngs-marquee-pause', changes['pauseOnHover'].currentValue ? 'paused' : 'running');
    }
  }

  ngAfterContentInit(): void {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    this._intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!this.isInView) {
          this.isInView = true;
        }
      } else if (this.isInView) {
        this.isInView = false;
      }
    });
    this._intersectionObserver.observe(this.nativeElement);
  }

  ngOnDestroy(): void {
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
  }
}
