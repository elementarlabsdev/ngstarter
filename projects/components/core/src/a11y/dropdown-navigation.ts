import { Injector, Signal, effect, untracked } from '@angular/core';
import {
  ActiveDescendantKeyManager,
  FocusKeyManager,
  FocusableOption,
  Highlightable,
  ListKeyManager,
  ListKeyManagerOption,
} from '@angular/cdk/a11y';

export interface DropdownNavigationConfig<T> {
  /** Editable fields use their native text editing instead of typeahead/Home/End. */
  typeahead?: boolean;
  homeAndEnd?: boolean;
  wrap?: boolean;
  skip?: (item: T) => boolean;
}

function configure<T extends ListKeyManagerOption, M extends ListKeyManager<T>>(
  manager: M,
  items: Signal<readonly T[]>,
  injector: Injector,
  config: DropdownNavigationConfig<T>,
): M {
  const skip = config.skip ?? (item => !!item.disabled);
  manager.withWrap(config.wrap ?? true).withHomeAndEnd(config.homeAndEnd ?? true)
    .skipPredicate(skip);
  if (config.typeahead !== false) {
    manager.withTypeAhead();
  }

  // CDK preserves an item's index after reordering, but doesn't clear removed items.
  const reconciliation = effect(() => {
    const currentItems = items();
    const active = manager.activeItem;
    const unavailable = active && (!currentItems.includes(active) || skip(active));
    if (unavailable) {
      untracked(() => manager.setActiveItem(-1));
    }
  }, { injector });
  const destroy = manager.destroy.bind(manager);
  manager.destroy = () => {
    reconciliation.destroy();
    destroy();
  };
  return manager;
}

/** Navigation for listbox popups whose DOM focus stays on the combobox. */
export function createDropdownActiveDescendantKeyManager<T extends Highlightable>(
  items: Signal<readonly T[]>,
  injector: Injector,
  config: DropdownNavigationConfig<T> = {},
): ActiveDescendantKeyManager<T> {
  return configure(new ActiveDescendantKeyManager<T>(items, injector), items, injector, config);
}

/** Navigation for action menus whose DOM focus moves between items. */
export function createDropdownFocusKeyManager<T extends FocusableOption>(
  items: Signal<readonly T[]>,
  injector: Injector,
  config: DropdownNavigationConfig<T> = {},
): FocusKeyManager<T> {
  return configure(new FocusKeyManager<T>(items, injector), items, injector, config);
}

/** Hidden fallback options may preserve a value, but must never become active. */
export function isDropdownItemHidden(element: HTMLElement): boolean {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const style = getComputedStyle(current);
    if (current.hidden || current.getAttribute('aria-hidden') === 'true' ||
        style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
  }
  return false;
}

/** Scroll only the popup's nearest scroll region, leaving the document in place. */
export function scrollDropdownItemIntoView(element: HTMLElement, panel: HTMLElement): void {
  let container = element.parentElement;
  while (container && container !== panel && (
    container.scrollHeight <= container.clientHeight ||
    !['auto', 'scroll'].includes(getComputedStyle(container).overflowY)
  )) {
    container = container.parentElement;
  }
  container ??= panel;
  const itemBounds = element.getBoundingClientRect();
  const bounds = container.getBoundingClientRect();
  const top = bounds.top + container.clientTop;
  const bottom = top + container.clientHeight;
  if (itemBounds.top < top) {
    container.scrollTop += itemBounds.top - top;
  } else if (itemBounds.bottom > bottom) {
    container.scrollTop += itemBounds.bottom - bottom;
  }
}

export function isDropdownTextInput(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement && (
    target.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]), textarea') ||
    target.isContentEditable
  );
}
