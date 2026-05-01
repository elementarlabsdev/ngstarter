import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MutationObserverService {
  constructor(private ngZone: NgZone) {}

  observe(element: Node, options?: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable(observer => {
      const mutationObserver = new MutationObserver(mutations => {
        this.ngZone.run(() => {
          observer.next(mutations);
        });
      });

      mutationObserver.observe(element, options);

      return () => {
        mutationObserver.disconnect();
      };
    });
  }
}
