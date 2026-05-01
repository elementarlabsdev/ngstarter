import { Component, inject, signal } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-wait-for-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  templateUrl: './wait-for-guided-tour-example.html',
})
export class WaitForGuidedTourExample {
  private readonly tourService = inject(TourService);
  showDynamicElement = signal(false);

  startTour(): void {
    this.showDynamicElement.set(false);

    this.tourService.start([
      {
        anchorId: 'static-element',
        title: 'Static Element',
        content: 'This element is always present.',
        withBackdrop: true
      },
      {
        anchorId: 'dynamic-element',
        title: 'Dynamic Element',
        content: 'This element appeared after a delay!',
        withBackdrop: true,
        waitFor: '[ngsTourAnchor="dynamic-element"]'
      }
    ]);

    // Simulate element appearance after 2 seconds
    setTimeout(() => {
      this.showDynamicElement.set(true);
    }, 2000);
  }
}
