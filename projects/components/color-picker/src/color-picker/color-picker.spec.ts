import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TinyColor } from '@ctrl/tinycolor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './color-picker';
import { Hue } from '../hue/hue';
import { Saturation } from '../saturation/saturation';
import { Alpha } from '../alpha/alpha';

@Component({
  imports: [ColorPicker, FormsModule],
  template: `<ngs-color-picker [(ngModel)]="color" [disabled]="disabled()" (rawColorChange)="rawColor.set($event)" />`
})
class Host {
  color = signal('red');
  disabled = signal(false);
  rawColor = signal<TinyColor | null>(null);
}

describe('ColorPicker', () => {
  let fixture: ComponentFixture<Host>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
  });

  async function render(color = 'red') {
    fixture.componentInstance.color.set(color);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  }

  function move(type: typeof Hue | typeof Saturation | typeof Alpha, x: number, y = 0) {
    fixture.debugElement.query(By.directive(type)).componentInstance.movePointer({ x, y, width: 100, height: 100 });
  }

  it('renders the default red color and supports opacity as the first interaction', async () => {
    await render();
    expect(fixture.nativeElement.querySelector('input').value).toBe('#ff0000');
    move(Alpha, 25);
    expect(new TinyColor(fixture.componentInstance.color()).getAlpha()).toBe(0.25);
  });

  it('preserves the initial opacity when changing saturation', async () => {
    await render('rgba(0, 128, 0, 0.3)');
    move(Saturation, 50, 50);
    expect(new TinyColor(fixture.componentInstance.color()).getAlpha()).toBe(0.3);
  });

  it('preserves saturation and brightness when changing hue', async () => {
    await render('#804040');
    const before = new TinyColor(fixture.componentInstance.color()).toHsv();
    move(Hue, 50);
    const after = new TinyColor(fixture.componentInstance.color()).toHsv();
    expect(after.h).toBeCloseTo(180);
    expect(after.s).toBeCloseTo(before.s);
    expect(after.v).toBeCloseTo(before.v);
    expect(fixture.componentInstance.rawColor()?.toHexString()).toBe('#408080');
  });

  it('synchronizes HEX edits and restores invalid text on blur', async () => {
    await render();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '#123456';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(new TinyColor(fixture.componentInstance.color()).toHexString()).toBe('#123456');
    expect(fixture.componentInstance.rawColor()?.toHexString()).toBe('#123456');
    input.value = '#oops';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.value).toBe('#123456');
  });

  it('updates the alpha gradient after selecting a different saturation', async () => {
    await render();
    move(Saturation, 0, 0);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.gradient').style.background).toContain('255, 255, 255');
  });

  it('selects colors through mouse events and ends dragging on mouseup', async () => {
    await render();
    const surface: HTMLElement = fixture.nativeElement.querySelector('ngs-saturation');
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);
    surface.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await new Promise(resolve => setTimeout(resolve, 30));
    fixture.detectChanges();
    expect(new TinyColor(fixture.componentInstance.color()).toHexString()).toBe('#804040');
    document.dispatchEvent(new MouseEvent('mousemove', {clientX: 100, clientY: 100}));
    expect(new TinyColor(fixture.componentInstance.color()).toHexString()).toBe('#804040');
  });

  it('keeps disabled controls from changing the value', async () => {
    await render();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
    move(Hue, 50);
    move(Saturation, 50, 50);
    move(Alpha, 25);
    expect(fixture.componentInstance.color()).toBe('red');
  });

  it('synchronizes external value changes without emitting user changes', async () => {
    await render();
    fixture.componentInstance.color.set('rgba(18, 52, 86, 0.4)');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').value).toBe('#123456');
    expect(fixture.componentInstance.rawColor()).toBeNull();
    move(Alpha, 75);
    expect(new TinyColor(fixture.componentInstance.color()).toHexString()).toBe('#123456');
    expect(new TinyColor(fixture.componentInstance.color()).getAlpha()).toBe(0.75);
  });

});
