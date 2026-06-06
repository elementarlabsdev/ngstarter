import '@angular/compiler';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SimpleSnackBar } from './simple-snack-bar/simple-snack-bar';
import { SnackBarConfig, SNACK_BAR_DATA } from './snack-bar-config';
import { SnackBarContainer } from './snack-bar-container/snack-bar-container';
import { SnackBarRef } from './snack-bar-ref';
import { SnackBar } from './snack-bar.service';

@Component({
  standalone: true,
  template: '<p class="custom-snack-message">{{ data.message }}</p>',
})
class CustomSnackContent {
  readonly data = inject<{ message: string }>(SNACK_BAR_DATA);
  readonly snackBarRef = inject(SnackBarRef<CustomSnackContent>);
}

@Component({
  standalone: true,
  template: `
    <ng-template #snack let-snackBarRef="snackBarRef" let-data>
      <span class="template-snack-message">
        {{ data.message }} {{ snackBarRef ? 'ready' : 'missing' }}
      </span>
    </ng-template>
  `,
})
class SnackTemplateHost {
  @ViewChild('snack', { static: true }) snack!: TemplateRef<{ message: string }>;
}

interface SnackBarTestContext {
  snackBar: SnackBar;
  overlayContainer: OverlayContainer;
}

async function setup(providers: any[] = []): Promise<SnackBarTestContext> {
  await TestBed.configureTestingModule({
    imports: [OverlayModule, CustomSnackContent, SimpleSnackBar, SnackTemplateHost],
    providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      ...providers,
    ],
  }).compileComponents();

  return {
    snackBar: TestBed.inject(SnackBar),
    overlayContainer: TestBed.inject(OverlayContainer),
  };
}

async function createContainer(
  config: Partial<SnackBarConfig> = {}
): Promise<ComponentFixture<SnackBarContainer>> {
  await TestBed.configureTestingModule({
    imports: [SnackBarContainer],
    providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: SnackBarConfig, useValue: { ...new SnackBarConfig(), ...config } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SnackBarContainer);
  fixture.detectChanges();

  return fixture;
}

async function createSimpleSnackBar(
  data: { message: string; action?: string },
  dismiss = vi.fn()
): Promise<ComponentFixture<SimpleSnackBar>> {
  await TestBed.configureTestingModule({
    imports: [SimpleSnackBar],
    providers: [
      { provide: SNACK_BAR_DATA, useValue: data },
      { provide: SnackBarRef, useValue: { dismiss } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SimpleSnackBar);
  fixture.detectChanges();

  return fixture;
}

function overlayRoot(overlayContainer: OverlayContainer): HTMLElement {
  return overlayContainer.getContainerElement();
}

function snackBarHost(overlayContainer: OverlayContainer): HTMLElement {
  return overlayRoot(overlayContainer).querySelector('ngs-snack-bar-container') as HTMLElement;
}

function snackBarContainer(root: ParentNode): HTMLElement {
  return root.querySelector('.snack-bar-container') as HTMLElement;
}

function transitionDone(container: SnackBarContainer, propertyName = 'transform'): void {
  const event = new Event('transitionend') as TransitionEvent;
  Object.defineProperty(event, 'propertyName', { value: propertyName });
  container.onTransitionEnd(event);
}

function detectOverlayChanges(): void {
  TestBed.inject(ApplicationRef).tick();
}

afterEach(() => {
  const overlayContainer = TestBed.inject(OverlayContainer, null, { optional: true });
  overlayContainer?.ngOnDestroy();
  TestBed.resetTestingModule();
});

describe('SnackBarContainer', () => {
  it('starts hidden from the configured vertical position and enters visibly', async () => {
    const fixture = await createContainer({ verticalPosition: 'top' });
    const component = fixture.componentInstance;

    expect(component.animationState()).toBe('hidden-top');
    expect(snackBarContainer(fixture.nativeElement).classList.contains('hidden-top')).toBe(true);

    component.enter();
    fixture.detectChanges();

    expect(component.animationState()).toBe('visible');
    expect(snackBarContainer(fixture.nativeElement).classList.contains('visible')).toBe(true);
  });

  it('marks the container as leaving and emits exit after a transition', async () => {
    const fixture = await createContainer({ verticalPosition: 'bottom' });
    const component = fixture.componentInstance;
    const exited: string[] = [];

    component._onExit.subscribe(() => exited.push('exit'));
    component.enter();
    component.exit();
    fixture.detectChanges();

    expect(component.animationState()).toBe('hidden-bottom');
    expect(component.leaving()).toBe(true);
    expect(snackBarContainer(fixture.nativeElement).classList.contains('leaving')).toBe(true);

    transitionDone(component, 'opacity');

    expect(exited).toEqual(['exit']);
  });
});

describe('SimpleSnackBar', () => {
  it('renders the message and action, then dismisses from the action button', async () => {
    const dismiss = vi.fn();
    const fixture = await createSimpleSnackBar({ message: 'Saved changes', action: 'Undo' }, dismiss);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).toContain('Saved changes');
    expect(button.textContent?.trim()).toBe('Undo');

    button.click();

    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('does not render an action region without action text', async () => {
    const fixture = await createSimpleSnackBar({ message: 'Saved changes' });

    expect(fixture.nativeElement.textContent).toContain('Saved changes');
    expect(fixture.nativeElement.querySelector('.simple-snack-bar-action')).toBeNull();
  });
});

describe('SnackBar', () => {
  it('opens simple snack bar content with message, action, and a visible container', async () => {
    const { snackBar, overlayContainer } = await setup();

    const ref = snackBar.open('Saved changes', 'Undo');
    detectOverlayChanges();

    expect(snackBarHost(overlayContainer)).toBeTruthy();
    expect(snackBarContainer(overlayRoot(overlayContainer)).classList.contains('visible')).toBe(true);
    expect(overlayRoot(overlayContainer).textContent).toContain('Saved changes');
    expect(overlayRoot(overlayContainer).textContent).toContain('Undo');
    expect(ref.instance).toBeInstanceOf(SimpleSnackBar);
    expect(ref.instance.data).toEqual({ message: 'Saved changes', action: 'Undo' });
    expect(ref.instance.snackBarRef).toBe(ref);
  });

  it('opens custom component content with injected data and snack bar ref', async () => {
    const { snackBar, overlayContainer } = await setup();

    const ref = snackBar.openFromComponent(CustomSnackContent, {
      data: { message: 'Custom content' },
    });
    detectOverlayChanges();

    expect(overlayRoot(overlayContainer).textContent).toContain('Custom content');
    expect(ref.instance).toBeInstanceOf(CustomSnackContent);
    expect(ref.instance.data).toEqual({ message: 'Custom content' });
    expect(ref.instance.snackBarRef).toBe(ref);
  });

  it('opens template content with data and a snackBarRef template context', async () => {
    const { snackBar, overlayContainer } = await setup();
    const fixture = TestBed.createComponent(SnackTemplateHost);
    fixture.detectChanges();

    snackBar.openFromTemplate(fixture.componentInstance.snack, {
      data: { message: 'Template content' },
    });
    detectOverlayChanges();

    expect(overlayRoot(overlayContainer).textContent).toContain('Template content ready');
  });

  it('dismisses the current snack bar before entering the next one', async () => {
    const { snackBar } = await setup();

    const first = snackBar.open('First');
    const second = snackBar.open('Second');

    expect(first.containerInstance.animationState()).toBe('hidden-bottom');
    expect(second.containerInstance.animationState()).toBe('hidden-bottom');

    transitionDone(first.containerInstance);
    detectOverlayChanges();

    expect(second.containerInstance.animationState()).toBe('visible');
  });
});
