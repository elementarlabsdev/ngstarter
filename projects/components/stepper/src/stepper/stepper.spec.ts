import '@angular/compiler';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Step } from '../step/step';
import { StepLabel } from '../step-label';
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

describe('Stepper', () => {
  it('should render a custom step label from ngsStepLabel', async () => {
    const fixture = await createFixture(CustomStepLabelHost);

    expect(stepLabelText(fixture)).toBe('Custom label');
  });

  it('should render the step label input when no custom label is projected', async () => {
    const fixture = await createFixture(FallbackStepLabelHost);

    expect(stepLabelText(fixture)).toBe('Fallback label');
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
  return (fixture.nativeElement.querySelector('.ngs-stepper-label') as HTMLElement).textContent?.trim() ?? '';
}
