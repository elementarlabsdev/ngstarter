import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GlobalStore } from '../global.state';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class PageTitleStrategyService extends TitleStrategy {
  private _title = inject(Title);
  private _globalStore = inject(GlobalStore);
  private _environmentService = inject(EnvironmentService);

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.cleanTitle(this.buildTitle(routerState));
    const pageTitle = this.cleanTitle(this._globalStore.pageTitle())
      || this.cleanTitle(this._environmentService.getValue('pageTitle'));
    const currentTitle = this.cleanTitle(this._title.getTitle());

    const nextTitle = title && pageTitle ? `${title} | ${pageTitle}` : title || pageTitle || currentTitle;

    if (nextTitle) {
      this._title.setTitle(nextTitle);
    }
  }

  private cleanTitle(title: string | undefined): string | null {
    if (!title) {
      return null;
    }

    const clean = title
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part && part.toLowerCase() !== 'undefined')
      .join(' - ')
      .trim();

    return clean || null;
  }
}
