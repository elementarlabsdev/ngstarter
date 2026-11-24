import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Option } from '@ngstarter-ui/components/select';
import { describe, expect, it, vi } from 'vitest';
import { MenuOptionGroupDirective } from './menu-option-group.directive';

@Component({
  imports: [MenuOptionGroupDirective, Option],
  template: `
    <div ngsMenuOptionGroup [(value)]="value">
      <ngs-option value="and">And</ngs-option>
      <ngs-option value="or">Or</ngs-option>
    </div>
  `,
})
class MenuOptionGroupHost {
  readonly value = signal('and');
}

describe('MenuOptionGroupDirective', () => {
  it('keeps the selected option in sync and emits once per click', () => {
    const fixture = TestBed.createComponent(MenuOptionGroupHost);
    fixture.detectChanges();

    const group = fixture.debugElement.query(By.directive(MenuOptionGroupDirective))
      .injector.get(MenuOptionGroupDirective);
    const [andOption, orOption] = group.options();
    expect(andOption.selected).toBe(true);
    expect(orOption.selected).toBe(false);

    fixture.componentInstance.value.set('or');
    fixture.detectChanges();
    expect(andOption.selected).toBe(false);
    expect(orOption.selected).toBe(true);

    const onSelection = vi.fn();
    const subscription = group.optionSelectionChanges.subscribe(onSelection);
    try {
      andOption.elementRef.nativeElement.click();
      fixture.detectChanges();

      expect(onSelection).toHaveBeenCalledExactlyOnceWith(andOption);
      expect(fixture.componentInstance.value()).toBe('and');
      expect(andOption.selected).toBe(true);
      expect(orOption.selected).toBe(false);
    } finally {
      subscription.unsubscribe();
    }
  });
});
