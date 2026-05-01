import {fromEvent, Observable} from 'rxjs';

export function typedFromEvent<E extends Event>(
    target: EventTarget,
    event: string,
    options?: EventListenerOptions | boolean,
): Observable<E> {
    return fromEvent(target, event, options as any) as Observable<E>;
}
