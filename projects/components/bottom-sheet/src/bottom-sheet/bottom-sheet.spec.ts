import '@angular/compiler';
import { DialogModule } from '@angular/cdk/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { BottomSheet, BOTTOM_SHEET_DEFAULT_OPTIONS } from './bottom-sheet';
import { BOTTOM_SHEET_DATA } from './bottom-sheet-config';
import { BottomSheetContainer } from './bottom-sheet-container';
import { BottomSheetRef } from './bottom-sheet-ref';

@Component({
  template: '<p class="sheet-message">{{ data?.message }}</p>',
})
class TestSheetContent {
  readonly data = inject<{ message: string } | null>(BOTTOM_SHEET_DATA, { optional: true });
  readonly bottomSheetRef = inject(BottomSheetRef<TestSheetContent>);
}

@Component({
  template: `
    <ng-template #sheet let-bottomSheetRef="bottomSheetRef">
      <span class="template-message">Template {{ bottomSheetRef ? 'ready' : 'missing' }}</span>
    </ng-template>
  `,
})
class TemplateHost {
  @ViewChild('sheet', { static: true }) sheet!: TemplateRef<{ bottomSheetRef: BottomSheetRef<unknown> }>;
}

interface BottomSheetTestContext {
  bottomSheet: BottomSheet;
  overlayContainer: OverlayContainer;
}

async function setup(providers: any[] = []): Promise<BottomSheetTestContext> {
  await TestBed.configureTestingModule({
    imports: [DialogModule, TestSheetContent, TemplateHost],
    providers,
  }).compileComponents();

  return {
    bottomSheet: TestBed.inject(BottomSheet),
    overlayContainer: TestBed.inject(OverlayContainer),
  };
}

function overlayRoot(overlayContainer: OverlayContainer): HTMLElement {
  return overlayContainer.getContainerElement();
}

function bottomSheetContainer(overlayContainer: OverlayContainer): HTMLElement {
  return overlayRoot(overlayContainer).querySelector('ngs-bottom-sheet-container') as HTMLElement;
}

function transitionDone(ref: BottomSheetRef<any>, propertyName = 'transform'): void {
  const event = new Event('transitionend') as TransitionEvent;
  Object.defineProperty(event, 'propertyName', { value: propertyName });
  ref.containerInstance._onTransitionEnd(event);
}

function detectOverlayChanges(): void {
  TestBed.inject(ApplicationRef).tick();
}

afterEach(() => {
  const overlayContainer = TestBed.inject(OverlayContainer, null, { optional: true });
  overlayContainer?.ngOnDestroy();
  TestBed.resetTestingModule();
});

describe('BottomSheet', () => {
  it('opens component content in a bottom sheet container with data and aria attributes', async () => {
    const { bottomSheet, overlayContainer } = await setup();

    const ref = bottomSheet.open(TestSheetContent, {
      data: { message: 'Account actions' },
      ariaLabel: 'Account actions sheet',
      ariaModal: true,
    });
    detectOverlayChanges();
    const container = bottomSheetContainer(overlayContainer);

    expect(container).toBeTruthy();
    expect(container.classList.contains('ngs-bottom-sheet-container')).toBe(true);
    expect(container.getAttribute('aria-label')).toBe('Account actions sheet');
    expect(container.getAttribute('aria-modal')).toBe('true');
    expect(container.getAttribute('tabindex')).toBe('-1');
    expect(overlayRoot(overlayContainer).textContent).toContain('Account actions');
    expect(ref.instance).toBeInstanceOf(TestSheetContent);
    expect(ref.instance.data).toEqual({ message: 'Account actions' });
    expect(ref.instance.bottomSheetRef).toBe(ref);
    expect(ref.componentRef).toBeTruthy();
    expect(ref.containerInstance).toBeInstanceOf(BottomSheetContainer);
    expect(ref.containerInstance._animationState).toBe('visible');
    expect(bottomSheet._openedBottomSheetRef).toBe(ref);
  });

  it('emits afterOpened only when the transform transition completes', async () => {
    const { bottomSheet } = await setup();
    const ref = bottomSheet.open(TestSheetContent);
    const opened: string[] = [];

    ref.afterOpened().subscribe(() => opened.push('opened'));
    transitionDone(ref, 'opacity');
    expect(opened).toEqual([]);

    transitionDone(ref);
    expect(opened).toEqual(['opened']);
  });

  it('dismisses through the service, emits the result, and clears the open ref', async () => {
    const { bottomSheet } = await setup();
    const ref = bottomSheet.open(TestSheetContent);
    const dismissed: Array<string | undefined> = [];

    ref.afterDismissed().subscribe(result => dismissed.push(result));
    bottomSheet.dismiss('accepted');
    expect(ref.containerInstance._animationState).toBe('hidden');

    transitionDone(ref);
    expect(dismissed).toEqual(['accepted']);
    expect(bottomSheet._openedBottomSheetRef).toBeNull();
  });

  it('opens template content with a bottomSheetRef template context', async () => {
    const { bottomSheet, overlayContainer } = await setup();
    const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    fixture.detectChanges();

    const ref = bottomSheet.open(fixture.componentInstance.sheet);
    detectOverlayChanges();

    expect(overlayRoot(overlayContainer).textContent).toContain('Template ready');
    expect(ref.instance).toBeNull();
    expect(ref.componentRef).toBeNull();
  });

  it('merges default options and lets explicit config override them', async () => {
    const { bottomSheet, overlayContainer } = await setup([
      {
        provide: BOTTOM_SHEET_DEFAULT_OPTIONS,
        useValue: {
          data: { message: 'Default message' },
          ariaLabel: 'Default label',
          disableClose: true,
        },
      },
    ]);

    const ref = bottomSheet.open(TestSheetContent, {
      data: { message: 'Override message' },
      ariaLabel: 'Override label',
    });
    detectOverlayChanges();
    const container = bottomSheetContainer(overlayContainer);

    expect(ref.disableClose).toBe(true);
    expect(ref.instance.data).toEqual({ message: 'Override message' });
    expect(container.getAttribute('aria-label')).toBe('Override label');
    expect(overlayRoot(overlayContainer).textContent).toContain('Override message');
  });

  it('dismisses the current sheet before entering the next sheet', async () => {
    const { bottomSheet } = await setup();

    const first = bottomSheet.open(TestSheetContent, { data: { message: 'First' } });
    const second = bottomSheet.open(TestSheetContent, { data: { message: 'Second' } });

    expect(first.containerInstance._animationState).toBe('hidden');
    expect(second.containerInstance._animationState).toBe('void');
    expect(bottomSheet._openedBottomSheetRef).toBe(second);

    transitionDone(first);
    expect(second.containerInstance._animationState).toBe('visible');
  });

  it('does nothing when dismiss is called without an open sheet', async () => {
    const { bottomSheet } = await setup();

    expect(() => bottomSheet.dismiss()).not.toThrow();
    expect(bottomSheet._openedBottomSheetRef).toBeNull();
  });

  it('dismisses the open sheet when the service is destroyed', async () => {
    const { bottomSheet } = await setup();
    const ref = bottomSheet.open(TestSheetContent);

    bottomSheet.ngOnDestroy();

    expect(ref.containerInstance._animationState).toBe('hidden');
  });
});
