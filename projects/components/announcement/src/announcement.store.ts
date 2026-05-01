import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AnnouncementData } from './types';

export interface AnnouncementState {
  announcement: AnnouncementData | null;
}

const initialState: AnnouncementState = {
  announcement: null,
};

export const AnnouncementStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    show(announcement: AnnouncementData): void {
      patchState(store, { announcement });
    },
    hide() {
      patchState(store, { announcement: null });
    }
  }))
);
