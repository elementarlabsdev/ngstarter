import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { v7 as uuid } from 'uuid';
import { IconRegistry } from '../icon-registry';

@Component({
  selector: 'ngs-icon',
  exportAs: 'ngsIcon',
  template: '<span [innerHTML]="_iconHtml()" style="display: contents"></span>',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-icon',
  }
})
export class Icon implements OnInit, OnChanges {
  private _sanitizer = inject(DomSanitizer);
  private _iconRegistry = inject(IconRegistry);
  protected _iconHtml = signal<SafeHtml | null>(null);

  name = input.required<string>();

  private loaded = false;
  private loadId = 0;

  async ngOnInit() {
    await this._loadIcon();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['name'] && !changes['name'].isFirstChange()) {
      if (changes['name'].previousValue === changes['name'].currentValue) {
        return;
      }

      this.loaded = false;
      await this._loadIcon();
    }
  }

  private async _loadIcon() {
    if (this.loaded) {
      return;
    }

    const name = this.name();
    const loadId = ++this.loadId;

    if (!name) {
      this.loaded = true;
      this._iconHtml.set(null);
      return;
    }

    const data = await this._iconRegistry.get(name).catch(() => null);

    if (loadId !== this.loadId || !data) {
      return;
    }

    let body = data.body;

    // If svg icon has mask of defs with id, we need to replace to unique id
    // because the same icons can be used on the same page and use the same id, which can cause problems.
    const allIdMatches = [...body.matchAll(/id="([^"]+)"/g)];

    if (allIdMatches.length > 0) {
      const idMap = new Map<string, string>();

      allIdMatches.forEach(match => {
        idMap.set(match[1], uuid());
      });

      idMap.forEach((nextId, previousId) => {
        body = body
          .replaceAll(`id="${previousId}"`, `id="${nextId}"`)
          .replaceAll(`url(#${previousId})`, `url(#${nextId})`)
          .replaceAll(`href="#${previousId}"`, `href="#${nextId}"`)
          .replaceAll(`xlink:href="#${previousId}"`, `xlink:href="#${nextId}"`);
      });
    }

    const iconHtml = `<svg viewBox="0 0 ${data.width} ${data.height}">${body}</svg>`;
    this._iconHtml.set(this._sanitizer.bypassSecurityTrustHtml(iconHtml));
    this.loaded = true;
  }
}
