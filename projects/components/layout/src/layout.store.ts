import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type VisibilityState = {
  visibility: Record<string, boolean>;
};

export const LayoutSidebarStore = signalStore(
  { providedIn: 'root' },
  withState<VisibilityState>({ visibility: {} }),
  withMethods((store) => ({
    isSidebarShown(layoutId: string): boolean {
      return store.visibility()[layoutId] ?? true;
    },
    showSidebarVisibility(layoutId: string, isShown: boolean): void {
      patchState(store, {
        visibility: { ...store.visibility(), [layoutId]: isShown }
      });
    }
  }))
);
