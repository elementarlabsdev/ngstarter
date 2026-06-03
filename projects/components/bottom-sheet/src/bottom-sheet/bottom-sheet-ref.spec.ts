import { ESCAPE } from '@angular/cdk/keycodes';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { Subject } from 'rxjs';
import { BottomSheetConfig } from './bottom-sheet-config';
import { BottomSheetRef } from './bottom-sheet-ref';

interface FakeBottomSheetRef<T = unknown, R = unknown> {
  ref: BottomSheetRef<T, R>;
  dialogRef: {
    closed: Subject<R | undefined>;
    backdropClick: Subject<MouseEvent>;
    keydownEvents: Subject<KeyboardEvent>;
    overlayRef: {
      detachBackdrop: ReturnType<typeof vi.fn>;
      detachments: () => Subject<void>;
    };
    close: ReturnType<typeof vi.fn>;
  };
  animationStateChanged: Subject<any>;
  container: {
    _animationStateChanged: Subject<any>;
    exit: ReturnType<typeof vi.fn>;
  };
  detachments: Subject<void>;
}

function createBottomSheetRef<T = unknown, R = unknown>(
  config: Partial<BottomSheetConfig> = {}
): FakeBottomSheetRef<T, R> {
  const closed = new Subject<R | undefined>();
  const backdropClick = new Subject<MouseEvent>();
  const keydownEvents = new Subject<KeyboardEvent>();
  const detachments = new Subject<void>();
  const animationStateChanged = new Subject<any>();
  const container = {
    _animationStateChanged: animationStateChanged,
    exit: vi.fn(),
  };
  const dialogRef = {
    closed,
    backdropClick,
    keydownEvents,
    overlayRef: {
      detachBackdrop: vi.fn(),
      detachments: () => detachments,
    },
    close: vi.fn((result?: R) => {
      closed.next(result);
      closed.complete();
    }),
  };

  return {
    ref: new BottomSheetRef<T, R>(
      dialogRef as any,
      { ...new BottomSheetConfig(), ...config },
      container
    ),
    dialogRef,
    animationStateChanged,
    container,
    detachments,
  };
}

function keydownEvent(keyCode: number, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    keyCode,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...options,
  } as unknown as KeyboardEvent;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('BottomSheetRef', () => {
  it('stores disableClose from config', () => {
    const { ref } = createBottomSheetRef({ disableClose: true });

    expect(ref.disableClose).toBe(true);
  });

  it('exposes the attached instance and component ref', () => {
    const { ref } = createBottomSheetRef<{ name: string }>();
    const instance = { name: 'Sheet' };
    const componentRef = { instance };

    ref._refInstance = instance;
    ref._refRef = componentRef;

    expect(ref.instance).toBe(instance);
    expect(ref.componentRef).toBe(componentRef);
  });

  it('emits afterOpened once when the visible animation completes', () => {
    const { ref, animationStateChanged } = createBottomSheetRef();
    const opened = vi.fn();
    const completed = vi.fn();

    ref.afterOpened().subscribe({ next: opened, complete: completed });
    animationStateChanged.next({ phaseName: 'start', toState: 'visible' });
    animationStateChanged.next({ phaseName: 'done', toState: 'visible' });
    animationStateChanged.next({ phaseName: 'done', toState: 'visible' });

    expect(opened).toHaveBeenCalledTimes(1);
    expect(completed).toHaveBeenCalledTimes(1);
  });

  it('accepts legacy animation events with phase for afterOpened', () => {
    const { ref, animationStateChanged } = createBottomSheetRef();
    const opened = vi.fn();

    ref.afterOpened().subscribe(opened);
    animationStateChanged.next({ phase: 'done', toState: 'visible' });

    expect(opened).toHaveBeenCalledOnce();
  });

  it('dismisses with a result, exits the container, and closes after the fallback timeout', () => {
    vi.useFakeTimers();
    const { ref, dialogRef, container } = createBottomSheetRef<unknown, string>();

    ref.dismiss('saved');

    expect(dialogRef.overlayRef.detachBackdrop).toHaveBeenCalledOnce();
    expect(container.exit).toHaveBeenCalledOnce();
    expect(dialogRef.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);
    expect(dialogRef.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(dialogRef.close).toHaveBeenCalledWith('saved');
  });

  it('closes immediately on hidden animation completion and clears the fallback timeout', () => {
    vi.useFakeTimers();
    const { ref, dialogRef, animationStateChanged } = createBottomSheetRef<unknown, string>();

    ref.dismiss('done');
    animationStateChanged.next({ phaseName: 'done', toState: 'hidden' });
    vi.advanceTimersByTime(400);

    expect(dialogRef.close).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledWith('done');
  });

  it('also closes when the container animation reaches void', () => {
    const { ref, dialogRef, animationStateChanged } = createBottomSheetRef<unknown, string>();

    ref.dismiss('void-result');
    animationStateChanged.next({ phaseName: 'done', toState: 'void' });

    expect(dialogRef.close).toHaveBeenCalledWith('void-result');
  });

  it('does not dismiss when the container is already unavailable', () => {
    const { ref, dialogRef } = createBottomSheetRef();

    ref.containerInstance = null;
    ref.dismiss();

    expect(dialogRef.overlayRef.detachBackdrop).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('closes when the overlay detaches', () => {
    const { dialogRef, detachments } = createBottomSheetRef();

    detachments.next();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });

  it('dismisses on backdrop click when closing is allowed', () => {
    const { ref, dialogRef, container } = createBottomSheetRef();

    dialogRef.backdropClick.next(new MouseEvent('click'));

    expect(dialogRef.overlayRef.detachBackdrop).toHaveBeenCalledOnce();
    expect(container.exit).toHaveBeenCalledOnce();
    expect(ref.backdropClick()).toBe(dialogRef.backdropClick);
  });

  it('ignores backdrop click when disableClose is true', () => {
    const { dialogRef, container } = createBottomSheetRef({ disableClose: true });

    dialogRef.backdropClick.next(new MouseEvent('click'));

    expect(dialogRef.overlayRef.detachBackdrop).not.toHaveBeenCalled();
    expect(container.exit).not.toHaveBeenCalled();
  });

  it('dismisses and prevents default on Escape when closing is allowed', () => {
    const { ref, dialogRef, container } = createBottomSheetRef();
    const event = keydownEvent(ESCAPE);

    dialogRef.keydownEvents.next(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(dialogRef.overlayRef.detachBackdrop).toHaveBeenCalledOnce();
    expect(container.exit).toHaveBeenCalledOnce();
    expect(ref.keydownEvents()).toBe(dialogRef.keydownEvents);
  });

  it('ignores Escape when disableClose is true', () => {
    const { dialogRef, container } = createBottomSheetRef({ disableClose: true });
    const event = keydownEvent(ESCAPE);

    dialogRef.keydownEvents.next(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(container.exit).not.toHaveBeenCalled();
  });

  it('ignores Escape with modifier keys', () => {
    const { dialogRef, container } = createBottomSheetRef();
    const event = keydownEvent(ESCAPE, { shiftKey: true });

    dialogRef.keydownEvents.next(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(container.exit).not.toHaveBeenCalled();
  });

  it('ignores non-Escape keydown events', () => {
    const { dialogRef, container } = createBottomSheetRef();

    dialogRef.keydownEvents.next(keydownEvent(13));

    expect(container.exit).not.toHaveBeenCalled();
  });

  it('exposes afterDismissed as the dialog closed stream', () => {
    const { ref, dialogRef } = createBottomSheetRef<unknown, string>();
    const dismissed = vi.fn();

    ref.afterDismissed().subscribe(dismissed);
    (dialogRef.close as (result?: string) => void)('closed');

    expect(dismissed).toHaveBeenCalledWith('closed');
  });
});
