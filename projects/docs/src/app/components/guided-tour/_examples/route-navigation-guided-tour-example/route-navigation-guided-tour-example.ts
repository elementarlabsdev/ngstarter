import { Component, inject } from '@angular/core';
import { TourService } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-route-navigation-guided-tour-example',
  standalone: true,
  imports: [Button],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <button ngsButton="filled" (click)="startTour()">Start Tour with Navigation</button>
      </div>

      <div class="flex gap-10 mt-10">
        <div id="route-step1" class="p-4 border rounded">
          Step 1: Current Page
        </div>
      </div>

      <p class="text-secondary mt-4">
        This example demonstrates how the tour can automatically navigate to a different route.
        The second step will navigate to the <b>Button</b> component page and wait for an element there.
      </p>
    </div>
  `,
})
export class RouteNavigationGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: '#route-step1',
        title: 'Step 1',
        content: 'We are currently on the Guided Tour page.',
        withBackdrop: true
      },
      {
        anchorId: 'button[ngsButton="filled"]', // Example element on Button page
        route: '/forms/buttons',
        waitFor: 'button[ngsButton="filled"]',
        title: 'Step 2: Button Page',
        content: 'The tour automatically navigated to the Button component page!',
        withBackdrop: true
      },
      {
        anchorId: '#route-step1',
        route: '/components/guided-tour',
        waitFor: '#route-step1',
        title: 'Step 3: Back',
        content: 'And now we are back to the Guided Tour page.',
        withBackdrop: true
      }
    ]);
  }
}
