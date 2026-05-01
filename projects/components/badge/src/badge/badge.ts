import {
  ApplicationRef,
  booleanAttribute,
  ComponentRef,
  computed,
  createComponent,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { BadgeContent } from './badge-content';
export { BadgeContent };

export type BadgePosition =
  | 'above after'
  | 'above before'
  | 'below after'
  | 'below before'
  | 'before'
  | 'after'
  | 'above'
  | 'below';

export type BadgeSize = 'small' | 'medium' | 'large';

@Directive({
  selector: '[ngsBadge]',
  standalone: true,
  host: {
    'class': 'ngs-badge',
    '[class.ngs-badge-small]': 'size() === "small"',
    '[class.ngs-badge-medium]': 'size() === "medium"',
    '[class.ngs-badge-large]': 'size() === "large"',
    '[class.ngs-badge-hidden]': 'hidden() || !content()',
    '[class.ngs-badge-disabled]': 'disabled()',
    '[class.ngs-primary]': 'color() === "primary"',
    '[class.ngs-accent]': 'color() === "accent"',
    '[class.ngs-warn]': 'color() === "warn"',
    '[class.ngs-badge-above]': 'isAbove()',
    '[class.ngs-badge-below]': '!isAbove()',
    '[class.ngs-badge-before]': '!isAfter()',
    '[class.ngs-badge-after]': 'isAfter()',
    '[class.ngs-badge-overlap]': 'overlap()',
  },
})
export class Badge implements OnInit, OnChanges, OnDestroy {
  private readonly _elementRef = inject(ElementRef);
  private readonly _applicationRef = inject(ApplicationRef);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _injector = inject(Injector);
  private readonly renderer = inject(Renderer2);

  readonly content = input<any>(null, { alias: 'ngsBadge' });
  readonly color = input<string>('primary', { alias: 'ngsBadgeColor' });
  readonly overlap = input(true, { transform: booleanAttribute, alias: 'ngsBadgeOverlap' });
  readonly disabled = input(false, { transform: booleanAttribute, alias: 'ngsBadgeDisabled' });
  readonly position = input<BadgePosition>('above after', { alias: 'ngsBadgePosition' });
  readonly size = input<BadgeSize>('medium', { alias: 'ngsBadgeSize' });
  readonly hidden = input(false, { transform: booleanAttribute, alias: 'ngsBadgeHidden' });
  readonly description = input<string>('', { alias: 'ngsBadgeDescription' });

  readonly isAbove = computed(() => this.position().indexOf('below') === -1);
  readonly isAfter = computed(() => this.position().indexOf('before') === -1);

  private _componentRef: ComponentRef<BadgeContent> | null = null;

  ngOnInit() {
    this.renderer.setStyle(this._elementRef.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this._elementRef.nativeElement, 'overflow', 'visible');
  }

  ngOnChanges() {
    this._updateBadge();
  }

  ngOnDestroy() {
    if (this._componentRef) {
      this._applicationRef.detachView(this._componentRef.hostView);
      this._componentRef.destroy();
      this._componentRef = null;
    }
  }

  private _updateBadge() {
    if (!this.content() && this._componentRef) {
      this._applicationRef.detachView(this._componentRef.hostView);
      this._componentRef.destroy();
      this._componentRef = null;
      return;
    }

    if (this.content() && !this._componentRef) {
      this._componentRef = createComponent(BadgeContent, {
        environmentInjector: this._environmentInjector,
        elementInjector: this._injector
      });
      this._applicationRef.attachView(this._componentRef.hostView);
      this._elementRef.nativeElement.appendChild(this._componentRef.location.nativeElement);
    }

    if (this._componentRef) {
      this._componentRef.instance.content = this.content();
      this._componentRef.changeDetectorRef.markForCheck();
    }
  }
}

