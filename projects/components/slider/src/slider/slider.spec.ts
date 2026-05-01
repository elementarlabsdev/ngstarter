import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Slider } from './slider';
import { SliderThumb } from '../slider-thumb';

@Component({
  standalone: true,
  imports: [Slider, SliderThumb],
  template: `
    <ngs-slider [min]="min()" [max]="max()" [step]="step()" [disabled]="disabled()">
      <input ngsSliderThumb [value]="value()">
    </ngs-slider>
  `
})
class TestComponent {
  min = signal(0);
  max = signal(100);
  step = signal(1);
  disabled = signal(false);
  value = signal(50);
}

describe('Slider Integration Tests', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let slider: Slider;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, Slider, SliderThumb]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    slider = (fixture.debugElement.children[0].componentInstance) as Slider;
  });

  it('should calculate percentage correctly', () => {
    const wrapper = fixture.nativeElement.querySelector('.ngs-slider-wrapper');
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      height: 10,
      bottom: 10,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {
      }
    } as DOMRect);

    const event = {clientX: 25} as MouseEvent;
    const percentage = (slider as any)._calculatePercentage(event);
    expect(percentage).toBe(0.25);
  });

  it('should calculate value from percentage', () => {
    const value = (slider as any)._calculateValueFromPercentage(0.5);
    expect(value).toBe(50);
  });

  it('should respect step when calculating value', () => {
    component.step.set(10);
    fixture.detectChanges();
    const value = (slider as any)._calculateValueFromPercentage(0.26);
    expect(value).toBe(30);
  });

  it('should clamp value within min and max', () => {
    component.min.set(10);
    component.max.set(90);
    fixture.detectChanges();

    const valueLow = (slider as any)._calculateValueFromPercentage(-0.1);
    expect(valueLow).toBe(10);

    const valueHigh = (slider as any)._calculateValueFromPercentage(1.1);
    expect(valueHigh).toBe(90);
  });
});

describe('SliderThumb Integration Tests', () => {
  let fixture: ComponentFixture<TestComponent>;
  let thumb: SliderThumb;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, Slider, SliderThumb]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const slider = (fixture.debugElement.children[0].componentInstance) as Slider;
    thumb = slider._allThumbs()[0];
  });

  it('should calculate percentage based on value', () => {
    (thumb as any)._value.set(25);
    expect(thumb.percentage).toBe(0.25);
  });

  it('should clamp value correctly', () => {
    const clamped = (thumb as any)._clampValue(150);
    expect(clamped).toBe(100);

    const clampedNegative = (thumb as any)._clampValue(-50);
    expect(clampedNegative).toBe(0);
  });
});
