export interface DigitRollerCapabilityOptions {
  respectMotionPreference?: boolean;
}

let staticCapable: boolean | undefined;
let prefersReducedMotion: boolean | undefined;

function isStaticallyCapable(): boolean {
  if (staticCapable !== undefined) {
    return staticCapable;
  }

  staticCapable =
    typeof window !== 'undefined' &&
    typeof window.CSS !== 'undefined' &&
    typeof window.Element !== 'undefined' &&
    typeof window.Element.prototype.animate === 'function' &&
    typeof window.CSS.registerProperty === 'function' &&
    window.CSS.supports('width', 'calc(mod(2, 10) * 1px)') &&
    supportsLinearEasing();

  return staticCapable;
}

function getPrefersReducedMotion(): boolean {
  if (prefersReducedMotion !== undefined) {
    return prefersReducedMotion;
  }

  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = mediaQuery.matches;

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', (event) => {
      prefersReducedMotion = event.matches;
    });
  }

  return prefersReducedMotion;
}

export function resetDigitRollerCapabilityCache(): void {
  staticCapable = undefined;
  prefersReducedMotion = undefined;
}

export function canAnimateDigitRoller(options: DigitRollerCapabilityOptions = {}): boolean {
  if (!isStaticallyCapable()) {
    return false;
  }

  return options.respectMotionPreference === false || !getPrefersReducedMotion();
}

function supportsLinearEasing(): boolean {
  try {
    document.createElement('div').animate({ opacity: 0 }, { easing: 'linear(0, 1)' });
    return true;
  } catch {
    return false;
  }
}
