import { Injectable } from '@angular/core';
import { getIcon, IconifyIconName, loadIcons } from 'iconify-icon';

export type IconData = NonNullable<ReturnType<typeof getIcon>>;

interface QueuedIcon {
  resolve: (icon: IconData) => void;
  reject: (reason?: unknown) => void;
}

@Injectable({
  providedIn: 'root',
})
export class IconRegistry {
  private readonly _cache = new Map<string, IconData>();
  private readonly _pending = new Map<string, Promise<IconData>>();
  private readonly _queue = new Map<string, QueuedIcon[]>();
  private _flushQueued = false;

  get(name: string): Promise<IconData> {
    const cached = this._cache.get(name);

    if (cached) {
      return Promise.resolve(cached);
    }

    const iconifyCached = getIcon(name);

    if (iconifyCached) {
      this._cache.set(name, iconifyCached);
      return Promise.resolve(iconifyCached);
    }

    const pending = this._pending.get(name);

    if (pending) {
      return pending;
    }

    const promise = new Promise<IconData>((resolve, reject) => {
      const queued = this._queue.get(name);

      if (queued) {
        queued.push({ resolve, reject });
      } else {
        this._queue.set(name, [{ resolve, reject }]);
      }
    });

    this._pending.set(name, promise);
    this._scheduleFlush();

    return promise;
  }

  clear(): void {
    this._cache.clear();
    this._pending.clear();
    this._queue.clear();
    this._flushQueued = false;
  }

  private _scheduleFlush(): void {
    if (this._flushQueued) {
      return;
    }

    this._flushQueued = true;
    queueMicrotask(() => this._flush());
  }

  private _flush(): void {
    this._flushQueued = false;

    const names = Array.from(this._queue.keys());

    if (!names.length) {
      return;
    }

    loadIcons(names, (loaded, missing, pending) => {
      loaded.forEach(icon => this._resolve(this._serializeName(icon)));
      missing.forEach(icon => this._reject(this._serializeName(icon), new Error(`Icon "${this._serializeName(icon)}" not found.`)));

      if (!pending.length) {
        names.forEach(name => {
          if (this._queue.has(name)) {
            this._reject(name, new Error(`Icon "${name}" was not loaded.`));
          }
        });
      }
    });
  }

  private _resolve(name: string): void {
    const icon = getIcon(name);

    if (!icon) {
      this._reject(name, new Error(`Icon "${name}" was loaded but no data was returned.`));
      return;
    }

    this._cache.set(name, icon);
    this._pending.delete(name);

    const queued = this._queue.get(name) ?? [];
    this._queue.delete(name);
    queued.forEach(item => item.resolve(icon));
  }

  private _reject(name: string, reason: unknown): void {
    this._pending.delete(name);

    const queued = this._queue.get(name) ?? [];
    this._queue.delete(name);
    queued.forEach(item => item.reject(reason));
  }

  private _serializeName(icon: IconifyIconName): string {
    const provider = icon.provider ? `@${icon.provider}:` : '';

    return `${provider}${icon.prefix}:${icon.name}`;
  }
}
