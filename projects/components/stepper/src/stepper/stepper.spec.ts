import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Step } from '../step/step';
import { StepLabel } from '../step-label';
import { StepperNext } from '../stepper-next';
import { StepperPrevious } from '../stepper-previous';
import { Stepper } from './stepper';

@Component({
  standalone: true,
  imports: [Step, StepLabel, Stepper],
  template: `
    <ngs-stepper>
      <ngs-step label="Fallback label">
        <ng-template ngsStepLabel>Custom label</ng-template>
        Step content
      </ngs-step>
    </ngs-stepper>
  `,
})
class CustomStepLabelHost {}

@Component({
  standalone: true,
  imports: [Step, Stepper],
  template: `
    <ngs-stepper>
      <ngs-step label="Fallback label">Step content</ngs-step>
    </ngs-stepper>
  `,
})
class FallbackStepLabelHost {}

@Component({
  standalone: true,
  imports: [Step, Stepper, StepperNext, StepperPrevious],
  template: `
    <ngs-stepper>
      <ngs-step label="Account">
        <p class="first-step-content">Account content</p>
        <button ngsStepperNext>Next</button>
      </ngs-step>
      <ngs-step label="Billing">
        <p class="second-step-content">Billing content</p>
        <button ngsStepperPrevious>Back</button>
      </ngs-step>
    </ngs-stepper>
  `,
})
class InteractiveStepperHost {}

@Component({
  standalone: true,
  imports: [Step, Stepper],
  template: `
    <ngs-stepper headerPosition="bottom" labelPosition="bottom">
      <ngs-step label="Account">Account content</ngs-step>
      <ngs-step label="Billing">Billing content</ngs-step>
    </ngs-stepper>
  `,
})
class BottomLabelStepperHost {}

@Component({
  standalone: true,
  imports: [Step, Stepper],
  template: `
    <ngs-stepper stickyHeader>
      <ngs-step label="Account">Account content</ngs-step>
      <ngs-step label="Billing">Billing content</ngs-step>
    </ngs-stepper>
  `,
})
class StickyHeaderStepperHost {}

@Component({
  standalone: true,
  imports: [Step, Stepper],
  template: `
    <ngs-stepper orientation="vertical">
      <ngs-step label="Account">Account content</ngs-step>
      <ngs-step label="Billing">Billing content</ngs-step>
    </ngs-stepper>
  `,
})
class VerticalStepperHost {}

describe('Stepper', () => {
  it('should render a custom step label from ngsStepLabel', async () => {
    const fixture = await createFixture(CustomStepLabelHost);

    expect(stepLabelText(fixture)).toBe('Custom label');
  });

  it('should render the step label input when no custom label is projected', async () => {
    const fixture = await createFixture(FallbackStepLabelHost);

    expect(stepLabelText(fixture)).toBe('Fallback label');
  });

  it('should select steps from header clicks and stepper controls', async () => {
    const fixture = await createFixture(InteractiveStepperHost);

    expect(stepContents(fixture).map((content) => content.hidden)).toEqual([false, true]);

    stepHeaders(fixture)[1].click();
    fixture.detectChanges();
    expect(stepContents(fixture).map((content) => content.hidden)).toEqual([true, false]);

    getButton(fixture, 'Back').click();
    fixture.detectChanges();
    expect(stepContents(fixture).map((content) => content.hidden)).toEqual([false, true]);

    getButton(fixture, 'Next').click();
    fixture.detectChanges();
    expect(stepContents(fixture).map((content) => content.hidden)).toEqual([true, false]);
  });

  it('should apply bottom header and bottom label classes', async () => {
    const fixture = await createFixture(BottomLabelStepperHost);

    expect(stepperElement(fixture).classList.contains('ngs-stepper-header-bottom')).toBe(true);
    expect(
      (
        fixture.nativeElement.querySelector('.ngs-stepper-header-container') as HTMLElement
      ).classList.contains('ngs-stepper-label-bottom-container'),
    ).toBe(true);
    expect(
      stepHeaders(fixture).every((header) => header.classList.contains('ngs-stepper-label-bottom')),
    ).toBe(true);
  });

  it('should apply the sticky header class when stickyHeader is enabled', async () => {
    const fixture = await createFixture(StickyHeaderStepperHost);

    expect(stepperHeaderContainer(fixture).classList.contains('ngs-stepper-header-sticky')).toBe(
      true,
    );
  });

  it('should render the vertical layout classes and connectors', async () => {
    const fixture = await createFixture(VerticalStepperHost);

    expect(stepperElement(fixture).classList.contains('ngs-stepper-vertical')).toBe(true);
    expect(stepperElement(fixture).classList.contains('ngs-stepper-horizontal')).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('.ngs-stepper-content-wrapper').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.ngs-stepper-vertical-line').length).toBe(2);
  });
});

async function createFixture<T>(component: new () => T): Promise<ComponentFixture<T>> {
  await TestBed.resetTestingModule()
    .configureTestingModule({
      imports: [component],
    })
    .compileComponents();

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}

function stepLabelText(fixture: ComponentFixture<unknown>): string {
  return (
    (hostElement(fixture).querySelector('.ngs-stepper-label') as HTMLElement).textContent?.trim() ??
    ''
  );
}

function stepperElement(fixture: ComponentFixture<unknown>): HTMLElement {
  return hostElement(fixture).querySelector('ngs-stepper > .ngs-stepper') as HTMLElement;
}

function stepHeaders(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from(hostElement(fixture).querySelectorAll('.ngs-stepper-header')) as HTMLElement[];
}

function stepperHeaderContainer(fixture: ComponentFixture<unknown>): HTMLElement {
  return hostElement(fixture).querySelector('.ngs-stepper-header-container') as HTMLElement;
}

function stepContents(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from(hostElement(fixture).querySelectorAll('.ngs-stepper-content')) as HTMLElement[];
}

function getButton(fixture: ComponentFixture<unknown>, text: string): HTMLButtonElement {
  return (Array.from(hostElement(fixture).querySelectorAll('button')) as HTMLButtonElement[]).find(
    (button) => button.textContent?.trim() === text,
  ) as HTMLButtonElement;
}

function hostElement(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}
