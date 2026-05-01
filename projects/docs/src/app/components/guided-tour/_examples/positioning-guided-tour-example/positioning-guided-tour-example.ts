import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-positioning-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  template: `
    <div class="flex flex-col gap-8 p-4 border border-outline-variant rounded-xl bg-surface-container-low">
      <div class="grid grid-cols-3 gap-8">
        <div ngsTourAnchor="above-start" class="p-4 bg-primary-container text-on-primary-container rounded-lg text-center text-xs w-full">
          above-start
        </div>
        <div ngsTourAnchor="above-center" class="p-4 bg-primary-container text-on-primary-container rounded-lg text-center text-xs w-full">
          above-center
        </div>
        <div ngsTourAnchor="above-end" class="p-4 bg-primary-container text-on-primary-container rounded-lg text-center text-xs w-full">
          above-end
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div ngsTourAnchor="before-start" class="p-4 bg-error-container text-on-error-container rounded-lg text-center text-xs">
          before-start
        </div>
        <div class="p-4 text-center text-xs">
          -
        </div>
        <div ngsTourAnchor="after-start" class="p-4 bg-surface-variant text-on-surface-variant rounded-lg text-center text-xs">
          after-start
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div ngsTourAnchor="before-center" class="p-4 bg-error-container text-on-error-container rounded-lg text-center text-xs">
          before-center
        </div>
        <div class="p-4 text-center text-xs">
          -
        </div>
        <div ngsTourAnchor="after-center" class="p-4 bg-surface-variant text-on-surface-variant rounded-lg text-center text-xs">
          after-center
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div ngsTourAnchor="before-end" class="p-4 bg-error-container text-on-error-container rounded-lg text-center text-xs">
          before-end
        </div>
        <div class="p-4 text-center text-xs">
          -
        </div>
        <div ngsTourAnchor="after-end" class="p-4 bg-surface-variant text-on-surface-variant rounded-lg text-center text-xs">
          after-end
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div ngsTourAnchor="below-start" class="p-4 bg-secondary-container text-on-secondary-container rounded-lg text-center text-xs">
          below-start
        </div>
        <div ngsTourAnchor="below-center" class="p-4 bg-secondary-container text-on-secondary-container rounded-lg text-center text-xs">
          below-center
        </div>
        <div ngsTourAnchor="below-end" class="p-4 bg-secondary-container text-on-secondary-container rounded-lg text-center text-xs">
          below-end
        </div>
      </div>

      <div class="flex justify-center mt-4">
        <button ngsButton="filled" (click)="startTour()">Start Positioning Tour</button>
      </div>
    </div>
  `,
})
export class PositioningGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'above-start',
        title: 'Above Start',
        content: 'This step is explicitly positioned ABOVE-START of the element.',
        position: 'above-start',
        withBackdrop: true,
      },
      {
        anchorId: 'above-center',
        title: 'Above Center',
        content: 'This step is explicitly positioned ABOVE-CENTER of the element.',
        position: 'above-center',
        withBackdrop: true,
      },
      {
        anchorId: 'above-end',
        title: 'Above End',
        content: 'This step is explicitly positioned ABOVE-END of the element.',
        position: 'above-end',
        withBackdrop: true,
      },
      {
        anchorId: 'below-start',
        title: 'Below Start',
        content: 'This step is explicitly positioned BELOW-START of the element.',
        position: 'below-start',
        withBackdrop: true,
      },
      {
        anchorId: 'below-center',
        title: 'Below Center',
        content: 'This step is explicitly positioned BELOW-CENTER of the element.',
        position: 'below-center',
        withBackdrop: true,
      },
      {
        anchorId: 'below-end',
        title: 'Below End',
        content: 'This step is explicitly positioned BELOW-END of the element.',
        position: 'below-end',
        withBackdrop: true,
      },
      {
        anchorId: 'before-start',
        title: 'Before Start',
        content: 'This step is explicitly positioned BEFORE-START of the element.',
        position: 'before-start',
        withBackdrop: true,
      },
      {
        anchorId: 'before-center',
        title: 'Before Center',
        content: 'This step is explicitly positioned BEFORE-CENTER of the element.',
        position: 'before-center',
        withBackdrop: true,
      },
      {
        anchorId: 'before-end',
        title: 'Before End',
        content: 'This step is explicitly positioned BEFORE-END of the element.',
        position: 'before-end',
        withBackdrop: true,
      },
      {
        anchorId: 'after-start',
        title: 'After Start',
        content: 'This step is explicitly positioned AFTER-START of the element.',
        position: 'after-start',
        withBackdrop: true,
      },
      {
        anchorId: 'after-center',
        title: 'After Center',
        content: 'This step is explicitly positioned AFTER-CENTER of the element.',
        position: 'after-center',
        withBackdrop: true,
      },
      {
        anchorId: 'after-end',
        title: 'After End',
        content: 'This step is explicitly positioned AFTER-END of the element.',
        position: 'after-end',
        withBackdrop: true,
      },
    ]);
  }
}
