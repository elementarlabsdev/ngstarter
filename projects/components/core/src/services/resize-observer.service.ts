import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeObserverService {
  constructor(private ngZone: NgZone) {}

  observe(element: Element): Observable<ResizeObserverEntry[]> {
    return new Observable(observer => {
      const resizeObserver = new ResizeObserver(entries => {
        this.ngZone.run(() => {
          observer.next(entries);
        });
      });

      resizeObserver.observe(element);

      return () => {
        resizeObserver.disconnect();
      };
    });
  }
}
