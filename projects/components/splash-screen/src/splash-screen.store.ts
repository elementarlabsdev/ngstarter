import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface SplashScreenState {
  visible: boolean;
}

const initialState: SplashScreenState = {
  visible: true
};

export const SplashScreenStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    show(): void {
      patchState(store, {
        visible: true
      });
    },
    hide(): void {
      patchState(store, {
        visible: false
      });
    }
  }))
);
