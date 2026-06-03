import { describe, expect, it } from 'vitest';
import { BottomSheetConfig } from './bottom-sheet-config';

describe('BottomSheetConfig', () => {
  it('uses the documented default values', () => {
    const config = new BottomSheetConfig();

    expect(config.data).toBeNull();
    expect(config.hasBackdrop).toBe(true);
    expect(config.disableClose).toBe(false);
    expect(config.ariaLabel).toBeNull();
    expect(config.ariaModal).toBe(false);
    expect(config.closeOnNavigation).toBe(true);
    expect(config.autoFocus).toBe('first-tabbable');
    expect(config.restoreFocus).toBe(true);
    expect(config.height).toBe('');
    expect(config.viewContainerRef).toBeUndefined();
    expect(config.panelClass).toBeUndefined();
    expect(config.direction).toBeUndefined();
    expect(config.backdropClass).toBeUndefined();
    expect(config.scrollStrategy).toBeUndefined();
    expect(config.minHeight).toBeUndefined();
    expect(config.maxHeight).toBeUndefined();
  });
});
