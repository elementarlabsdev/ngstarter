import {
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  input,
  model,
  effect,
  NgZone,
  OnDestroy,
  OnInit,
  booleanAttribute,
  numberAttribute
} from '@angular/core';
import { normalizePassiveListenerOptions, _getEventTarget, Platform } from '@angular/cdk/platform';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';

/** Possible states for a ripple element. */
export enum RippleState {
  FADING_IN = 0,
  VISIBLE = 1,
  FADING_OUT = 2,
  HIDDEN = 3,
}

export interface RippleConfig {
  color?: string;
  centered?: boolean;
  radius?: number;
  persistent?: boolean;
  animation?: RippleAnimationConfig;
  terminateOnPointerUp?: boolean;
}

export interface RippleAnimationConfig {
  enterDuration?: number;
  exitDuration?: number;
}

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {
  /** Current state of the ripple. */
  state: RippleState = RippleState.HIDDEN;

  constructor(
    private _renderer: { fadeOutRipple(ref: RippleRef): void },
    /** Reference to the ripple HTML element. */
    public element: HTMLElement,
    /** Ripple configuration used for the ripple. */
    public config: RippleConfig,
    /* Whether animations are forcibly disabled for ripples through CSS. */
    public _animationForciblyDisabledThroughCss = false
  ) {}

  /** Fades out the ripple element. */
  fadeOut() {
    this._renderer.fadeOutRipple(this);
  }
}

/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});

/** Manages events through delegation so that as few event handlers as possible are bound. */
class RippleEventManager {
  private _events = new Map<string, Map<HTMLElement, Set<EventListenerObject>>>();

  /** Adds an event handler. */
  addHandler(ngZone: NgZone, name: string, element: HTMLElement, handler: EventListenerObject) {
    const handlersForEvent = this._events.get(name);
    if (handlersForEvent) {
      const handlersForElement = handlersForEvent.get(element);
      if (handlersForElement) {
        handlersForElement.add(handler);
      } else {
        handlersForEvent.set(element, new Set([handler]));
      }
    } else {
      this._events.set(name, new Map([[element, new Set([handler])]]));
      ngZone.runOutsideAngular(() => {
        document.addEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
      });
    }
  }

  /** Removes an event handler. */
  removeHandler(name: string, element: HTMLElement, handler: EventListenerObject) {
    const handlersForEvent = this._events.get(name);
    if (!handlersForEvent) {
      return;
    }

    const handlersForElement = handlersForEvent.get(element);
    if (!handlersForElement) {
      return;
    }

    handlersForElement.delete(handler);

    if (handlersForElement.size === 0) {
      handlersForEvent.delete(element);
    }

    if (handlersForEvent.size === 0) {
      this._events.delete(name);
      document.removeEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
    }
  }

  /** Event handler that is bound and which dispatches the events to the different targets. */
  private _delegateEventHandler = (event: Event) => {
    const target = _getEventTarget(event) as HTMLElement;
    if (target) {
      this._events.get(event.type)?.forEach((handlers, element) => {
        if (element === target || element.contains(target)) {
          handlers.forEach(handler => handler.handleEvent(event));
        }
      });
    }
  };
}

/**
 * Default ripple animation configuration for ripples without an explicit
 * animation config specified.
 */
export const defaultRippleAnimationConfig = {
  enterDuration: 225,
  exitDuration: 150,
};

/**
 * Timeout for ignoring mouse events. Mouse events will be temporary ignored after touch
 * events to avoid synthetic mouse events.
 */
const ignoreMouseEventsTimeout = 800;

/** Events that signal that the pointer is down. */
const pointerDownEvents = ['mousedown', 'touchstart'];

/** Events that signal that the pointer is up. */
const pointerUpEvents = ['mouseup', 'mouseleave', 'touchend', 'touchcancel'];

/**
 * Helper service that performs DOM manipulations. Not intended to be used outside this module.
 */
export class RippleRenderer implements EventListenerObject {
  /** Element where the ripples are being added to. */
  private _containerElement: HTMLElement;
  /** Element which triggers the ripple elements on mouse events. */
  private _triggerElement: HTMLElement | null = null;
  /** Whether the pointer is currently down or not. */
  private _isPointerDown = false;
  /** Map of currently active ripple references. */
  private _activeRipples = new Map<RippleRef, any>();
  /** Latest non-persistent ripple that was triggered. */
  private _mostRecentTransientRipple: RippleRef | null = null;
  /** Time in milliseconds when the last touchstart event happened. */
  private _lastTouchStartEvent: number | null = null;
  /** Whether pointer-up event listeners have been registered. */
  private _pointerUpEventsRegistered = false;
  /** Cached dimensions of the ripple container. */
  private _containerRect: DOMRect | null = null;

  private static _eventManager = new RippleEventManager();

  constructor(
    private _target: { rippleConfig: RippleConfig; rippleDisabled: boolean },
    private _ngZone: NgZone,
    elementOrElementRef: HTMLElement | ElementRef<HTMLElement>,
    private _platform: Platform
  ) {
    // Only do anything if we're on the browser.
    if (_platform.isBrowser) {
      this._containerElement = coerceElement(elementOrElementRef);
    }
  }

  /** Fades in a ripple at the given coordinates. */
  fadeInRipple(x: number, y: number, config: RippleConfig = {}): RippleRef {
    const containerRect = (this._containerRect =
      this._containerRect || this._containerElement.getBoundingClientRect());
    const animationConfig = { ...defaultRippleAnimationConfig, ...config.animation };

    if (config.centered) {
      x = containerRect.left + containerRect.width / 2;
      y = containerRect.top + containerRect.height / 2;
    }

    const radius = config.radius || distanceToFurthestCorner(x, y, containerRect);
    const offsetX = x - containerRect.left;
    const offsetY = y - containerRect.top;
    const enterDuration = animationConfig.enterDuration;

    const ripple = document.createElement('div');
    ripple.classList.add('ngs-ripple-element');

    ripple.style.left = `${offsetX - radius}px`;
    ripple.style.top = `${offsetY - radius}px`;
    ripple.style.height = `${radius * 2}px`;
    ripple.style.width = `${radius * 2}px`;

    if (config.color != null) {
      ripple.style.backgroundColor = config.color;
    }

    ripple.style.transitionDuration = `${enterDuration}ms`;

    this._containerElement.appendChild(ripple);

    const computedStyles = window.getComputedStyle(ripple);
    const userTransitionProperty = computedStyles.transitionProperty;
    const userTransitionDuration = computedStyles.transitionDuration;

    const animationForciblyDisabledThroughCss =
      userTransitionProperty === 'none' ||
      userTransitionDuration === '0s' ||
      userTransitionDuration === '0s, 0s' ||
      (containerRect.width === 0 && containerRect.height === 0);

    const rippleRef = new RippleRef(this, ripple, config, animationForciblyDisabledThroughCss);

    ripple.style.transform = 'scale3d(1, 1, 1)';
    rippleRef.state = RippleState.FADING_IN;

    if (!config.persistent) {
      this._mostRecentTransientRipple = rippleRef;
    }

    let eventListeners: any = null;

    if (!animationForciblyDisabledThroughCss && (enterDuration || animationConfig.exitDuration)) {
      this._ngZone.runOutsideAngular(() => {
        const onTransitionEnd = () => {
          if (eventListeners) {
            eventListeners.fallbackTimer = null;
          }
          clearTimeout(fallbackTimer);
          this._finishRippleTransition(rippleRef);
        };
        const onTransitionCancel = () => this._destroyRipple(rippleRef);
        const fallbackTimer = setTimeout(onTransitionCancel, (enterDuration || 0) + 100);

        ripple.addEventListener('transitionend', onTransitionEnd);
        ripple.addEventListener('transitioncancel', onTransitionCancel);

        eventListeners = { onTransitionEnd, onTransitionCancel, fallbackTimer };
      });
    }

    this._activeRipples.set(rippleRef, eventListeners);

    if (animationForciblyDisabledThroughCss || !enterDuration) {
      this._finishRippleTransition(rippleRef);
    }

    return rippleRef;
  }

  /** Fades out a ripple reference. */
  fadeOutRipple(rippleRef: RippleRef) {
    if (rippleRef.state === RippleState.FADING_OUT || rippleRef.state === RippleState.HIDDEN) {
      return;
    }

    const rippleEl = rippleRef.element;
    const animationConfig = { ...defaultRippleAnimationConfig, ...rippleRef.config.animation };

    rippleEl.style.transitionDuration = `${animationConfig.exitDuration}ms`;
    rippleEl.style.opacity = '0';
    rippleRef.state = RippleState.FADING_OUT;

    if (rippleRef._animationForciblyDisabledThroughCss || !animationConfig.exitDuration) {
      this._finishRippleTransition(rippleRef);
    }
  }

  /** Fades out all currently active ripples. */
  fadeOutAll() {
    this._getActiveRipples().forEach(ripple => ripple.fadeOut());
  }

  /** Fades out all currently showing non-persistent ripples. */
  fadeOutAllNonPersistent() {
    this._getActiveRipples().forEach(ripple => {
      if (!ripple.config.persistent) {
        ripple.fadeOut();
      }
    });
  }

  /** Sets up the trigger event listeners */
  setupTriggerEvents(elementOrElementRef: HTMLElement | ElementRef<HTMLElement>) {
    const element = coerceElement(elementOrElementRef);

    if (!this._platform.isBrowser || !element || element === this._triggerElement) {
      return;
    }

    this._removeTriggerEvents();
    this._triggerElement = element;

    pointerDownEvents.forEach(type => {
      RippleRenderer._eventManager.addHandler(this._ngZone, type, element, this);
    });
  }

  /** Handles all registered events. */
  handleEvent(event: Event) {
    if (event.type === 'mousedown') {
      this._onMousedown(event as MouseEvent);
    } else if (event.type === 'touchstart') {
      this._onTouchStart(event as TouchEvent);
    } else {
      this._onPointerUp();
    }

    if (!this._pointerUpEventsRegistered && this._triggerElement) {
      this._ngZone.runOutsideAngular(() => {
        pointerUpEvents.forEach(type => {
          this._triggerElement!.addEventListener(type, this, passiveCapturingEventOptions);
        });
      });
      this._pointerUpEventsRegistered = true;
    }
  }

  /** Method that will be called if the fade-in or fade-in transition completed. */
  private _finishRippleTransition(rippleRef: RippleRef) {
    if (rippleRef.state === RippleState.FADING_IN) {
      this._startFadeOutTransition(rippleRef);
    } else if (rippleRef.state === RippleState.FADING_OUT) {
      this._destroyRipple(rippleRef);
    }
  }

  /** Starts the fade-out transition of the given ripple. */
  private _startFadeOutTransition(rippleRef: RippleRef) {
    const isMostRecentTransientRipple = rippleRef === this._mostRecentTransientRipple;
    const { persistent } = rippleRef.config;

    rippleRef.state = RippleState.VISIBLE;

    if (!persistent && (!isMostRecentTransientRipple || !this._isPointerDown)) {
      rippleRef.fadeOut();
    }
  }

  /** Destroys the given ripple. */
  private _destroyRipple(rippleRef: RippleRef) {
    const eventListeners = this._activeRipples.get(rippleRef) ?? null;
    this._activeRipples.delete(rippleRef);

    if (!this._activeRipples.size) {
      this._containerRect = null;
    }

    if (rippleRef === this._mostRecentTransientRipple) {
      this._mostRecentTransientRipple = null;
    }

    rippleRef.state = RippleState.HIDDEN;

    if (eventListeners !== null) {
      rippleRef.element.removeEventListener('transitionend', eventListeners.onTransitionEnd);
      rippleRef.element.removeEventListener('transitioncancel', eventListeners.onTransitionCancel);
      if (eventListeners.fallbackTimer !== null) {
        clearTimeout(eventListeners.fallbackTimer);
      }
    }

    rippleRef.element.remove();
  }

  /** Function being called whenever the trigger is being pressed using mouse. */
  private _onMousedown(event: MouseEvent) {
    const isFakeMousedown = isFakeMousedownFromScreenReader(event);
    const isSyntheticEvent =
      this._lastTouchStartEvent && Date.now() < this._lastTouchStartEvent + ignoreMouseEventsTimeout;

    if (!this._target.rippleDisabled && !isFakeMousedown && !isSyntheticEvent) {
      this._isPointerDown = true;
      this.fadeInRipple(event.clientX, event.clientY, this._target.rippleConfig);
    }
  }

  /** Function being called whenever the trigger is being pressed using touch. */
  private _onTouchStart(event: TouchEvent) {
    if (!this._target.rippleDisabled && !isFakeTouchstartFromScreenReader(event)) {
      this._lastTouchStartEvent = Date.now();
      this._isPointerDown = true;

      const touches = event.changedTouches;
      if (touches) {
        for (let i = 0; i < touches.length; i++) {
          this.fadeInRipple(touches[i].clientX, touches[i].clientY, this._target.rippleConfig);
        }
      }
    }
  }

  /** Function being called whenever the trigger is being released. */
  private _onPointerUp() {
    if (!this._isPointerDown) {
      return;
    }

    this._isPointerDown = false;

    this._getActiveRipples().forEach(ripple => {
      const isVisible =
        ripple.state === RippleState.VISIBLE ||
        (ripple.config.terminateOnPointerUp && ripple.state === RippleState.FADING_IN);

      if (!ripple.config.persistent && isVisible) {
        ripple.fadeOut();
      }
    });
  }

  private _getActiveRipples(): RippleRef[] {
    return Array.from(this._activeRipples.keys());
  }

  /** Removes previously registered event listeners from the trigger element. */
  _removeTriggerEvents() {
    const trigger = this._triggerElement;
    if (trigger) {
      pointerDownEvents.forEach(type => RippleRenderer._eventManager.removeHandler(type, trigger, this));
      if (this._pointerUpEventsRegistered) {
        pointerUpEvents.forEach(type =>
          trigger.removeEventListener(type, this, passiveCapturingEventOptions)
        );
        this._pointerUpEventsRegistered = false;
      }
    }
  }
}

/** Returns the distance from the point (x, y) to the furthest corner of a rectangle. */
function distanceToFurthestCorner(x: number, y: number, rect: DOMRect) {
  const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
  const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
  return Math.sqrt(distX * distX + distY * distY);
}

export interface RippleGlobalOptions {
  disabled?: boolean;
  animation?: RippleAnimationConfig;
  terminateOnPointerUp?: boolean;
}

export const RIPPLE_GLOBAL_OPTIONS = new InjectionToken<RippleGlobalOptions>(
  'ngs-ripple-global-options'
);

@Directive({
  selector: '[ngsRipple]',
  exportAs: 'ngsRipple',
  host: {
    'class': 'ngs-ripple',
    '[class.ngs-ripple-unbounded]': 'unbounded()',
  },
})
export class Ripple implements OnInit, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _ngZone = inject(NgZone);
  private _platform = inject(Platform);
  private _globalOptions = inject(RIPPLE_GLOBAL_OPTIONS, { optional: true }) || {};

  color = input<string | undefined>(undefined, { alias: 'ngsRippleColor' });
  unbounded = input(false, { alias: 'ngsRippleUnbounded', transform: booleanAttribute });
  centered = model(false, { alias: 'ngsRippleCentered' });
  radius = input(0, { alias: 'ngsRippleRadius', transform: numberAttribute });
  animation = input<RippleAnimationConfig | undefined>(undefined, { alias: 'ngsRippleAnimation' });
  disabled = model(false, { alias: 'ngsRippleDisabled' });
  trigger = model<HTMLElement | undefined>(undefined, { alias: 'ngsRippleTrigger' });

  private _rippleRenderer: RippleRenderer;
  private _isInitialized = false;

  constructor() {
    this._rippleRenderer = new RippleRenderer(this, this._ngZone, this._elementRef, this._platform);

    effect(() => {
      if (this.disabled()) {
        this.fadeOutAllNonPersistent();
      }
      this._setupTriggerEventsIfEnabled();
    });

    effect(() => {
      this.trigger();
      this._setupTriggerEventsIfEnabled();
    });
  }

  ngOnInit() {
    this._isInitialized = true;
    this._setupTriggerEventsIfEnabled();
  }

  ngOnDestroy() {
    this._rippleRenderer._removeTriggerEvents();
  }

  /** Fades out all currently showing ripple elements. */
  fadeOutAll() {
    this._rippleRenderer.fadeOutAll();
  }

  /** Fades out all currently showing non-persistent ripple elements. */
  fadeOutAllNonPersistent() {
    this._rippleRenderer.fadeOutAllNonPersistent();
  }

  get rippleConfig(): RippleConfig {
    return {
      centered: this.centered(),
      radius: this.radius(),
      color: this.color(),
      animation: {
        ...this._globalOptions.animation,
        ...this.animation(),
      },
      terminateOnPointerUp: this._globalOptions.terminateOnPointerUp,
    };
  }

  get rippleDisabled(): boolean {
    return this.disabled() || !!this._globalOptions.disabled;
  }

  private _setupTriggerEventsIfEnabled() {
    if (!this.disabled() && this._isInitialized) {
      this._rippleRenderer.setupTriggerEvents(this.trigger() || this._elementRef.nativeElement);
    }
  }

  /** Launches a manual ripple at the specified coordinates or just by the ripple config. */
  launch(configOrX: number | RippleConfig, y: number = 0, config?: RippleConfig): RippleRef {
    if (typeof configOrX === 'number') {
      return this._rippleRenderer.fadeInRipple(configOrX, y, { ...this.rippleConfig, ...config });
    } else {
      return this._rippleRenderer.fadeInRipple(0, 0, { ...this.rippleConfig, ...configOrX });
    }
  }
}
