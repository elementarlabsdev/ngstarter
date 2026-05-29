import { Component, inject } from '@angular/core';
import { TourService } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-route-navigation-guided-tour-example',
  standalone: true,
  imports: [Button],
  templateUrl: './route-navigation-guided-tour-example.html',
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
