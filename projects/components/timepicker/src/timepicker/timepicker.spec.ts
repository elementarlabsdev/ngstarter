import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TimepickerInput } from '../timepicker-input/timepicker-input';
import { Timepicker } from './timepicker';

@Component({
  imports: [Timepicker, TimepickerInput],
  template: `
    <input [ngsTimepicker]="picker">
    <ngs-timepicker #picker/>
  `
})
class TimepickerHost {}

describe('Timepicker placement', () => {
  it.each(['above', 'below'] as const)('animates %s the field without a gap', async placement => {
    const fixture = TestBed.createComponent(TimepickerHost);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    Object.assign(input.style, {
      position: 'fixed',
      left: '20px',
      height: '32px',
      [placement === 'above' ? 'bottom' : 'top']: '8px',
    });
    input.click();

    const panel = TestBed.inject(OverlayContainer).getContainerElement()
      .querySelector<HTMLElement>('.ngs-timepicker-panel')!;
    panel.style.animationPlayState = 'paused';
    fixture.detectChanges();
    await fixture.whenStable();

    const [animation] = panel.getAnimations();
    animation.currentTime = 0;

    const field = input.getBoundingClientRect();
    const opening = panel.getBoundingClientRect();
    animation.finish();
    const opened = panel.getBoundingClientRect();

    expect(opening.height).toBeLessThan(opened.height);
    if (placement === 'above') {
      expect(opening.bottom).toBeCloseTo(field.top, 0);
      expect(opened.bottom).toBeCloseTo(field.top, 0);
    } else {
      expect(opening.top).toBeCloseTo(field.bottom, 0);
      expect(opened.top).toBeCloseTo(field.bottom, 0);
    }
  });
});
