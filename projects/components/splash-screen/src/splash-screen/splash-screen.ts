import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  Renderer2
} from '@angular/core';
import { getState } from '@ngrx/signals';
import { SplashScreenState, SplashScreenStore } from '../splash-screen.store';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'ngs-splash-screen',
  exportAs: 'ngsSplashScreen',
  imports: [],
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss',
  host: {
    'class': 'ngs-splash-screen',
  }
})
export class SplashScreen {
  private _store = inject(SplashScreenStore);
  private _renderer = inject(Renderer2);
  private _elementRef = inject(ElementRef);
  private _router = inject(Router);

  animationDuration = input(500, {
    transform: numberAttribute
  }); // in milliseconds
  hideDelay = input(1000, {
    transform: numberAttribute
  }); // in milliseconds

  constructor() {
    const initialState = getState<SplashScreenState>(this._store);

    effect(() => {
      const currentState = getState<SplashScreenState>(this._store);

      if (initialState.visible === currentState.visible) {
        return;
      }

      if (currentState.visible) {
        this._show();
      } else {
        this._hide();
      }
    });

    afterNextRender(() => {
      const hideOnNavigationEnd = () => {
        setTimeout(() => {
          this._hide();
        }, this.hideDelay());
      };

      if (this._router.navigated) {
        hideOnNavigationEnd();
        return;
      }

      const subscription = this._router.events
        .pipe(
          filter(event=> event instanceof NavigationEnd)
        )
        .subscribe(() => {
          subscription.unsubscribe();
          hideOnNavigationEnd();
        });
    });
  }

  ngOnInit() {
    this._renderer.setProperty(
      this._elementRef.nativeElement, '--ngs-splash-screen-hide-animation-duration', (this.animationDuration() / 1000) + 's'
    );
  }

  private _show(): void {
    const loaderEl = this._elementRef.nativeElement as HTMLElement;
    this._renderer.setStyle(loaderEl, 'visibility', 'visible');
    this._renderer.setStyle(loaderEl, 'zIndex', '9999999');
  }

  private _hide(): void {
    const loaderEl = this._elementRef.nativeElement as HTMLElement;
    this._renderer.addClass(loaderEl, 'hide');
    setTimeout(() => {
      this._renderer.setStyle(loaderEl, 'visibility', 'hidden');
      this._renderer.setStyle(loaderEl, 'zIndex', '-9999999');
    }, this.animationDuration());
  }
}
