import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective, provideTourConfig } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-global-config-guided-tour-example',
  standalone: true,
  imports: [Button],
  providers: [
    provideTourConfig({
      nextBtnText: 'Global Next',
      prevBtnText: 'Global Prev',
      finishBtnText: 'Global Finish',
      skipBtnText: 'Global Close',
      padding: 20,
    })
  ],
  templateUrl: './global-config-guided-tour-example.html',
  styleUrl: './global-config-guided-tour-example.scss',
})
export class GlobalConfigGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: '#global-step1',
        title: 'Global Configuration',
        content: 'This tour uses global button labels and padding defined in providers.',
        withBackdrop: true,
      },
      {
        anchorId: '#global-step2',
        title: 'Step 2',
        content: 'Notice the custom button texts and larger padding.',
        withBackdrop: true,
      }
    ]);
  }
}
