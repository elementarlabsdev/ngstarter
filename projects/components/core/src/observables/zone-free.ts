import {NgZone, inject} from '@angular/core';
import {SchedulerLike, Subscription} from 'rxjs';

export function zonefreeScheduler(): SchedulerLike {
    const zone = inject(NgZone);

    return {
        now: () => Date.now(),
        schedule: (work: any, delay: any, state: any) => {
            return zone.runOutsideAngular(() => {
                const id = setTimeout(() => work(state), delay);
                return new Subscription(() => clearTimeout(id));
            });
        },
    } as any;
}
