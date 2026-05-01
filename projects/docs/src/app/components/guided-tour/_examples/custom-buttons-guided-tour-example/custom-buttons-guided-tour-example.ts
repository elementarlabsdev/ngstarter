import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-custom-buttons-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  templateUrl: './custom-buttons-guided-tour-example.html',
  styleUrl: './custom-buttons-guided-tour-example.scss',
})
export class CustomButtonsGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'custom-btn-step1',
        title: 'Custom Buttons',
        content: 'You can change button text for each step.',
        nextBtnText: 'Go Ahead',
        skipBtnText: 'Dismiss',
        withBackdrop: true,
      },
      {
        anchorId: 'custom-btn-step2',
        title: 'Another Step',
        content: 'This step has different custom button labels.',
        nextBtnText: 'Finalize',
        prevBtnText: 'Go Back',
        skipBtnText: 'Exit',
        withBackdrop: true,
      },
      {
        anchorId: 'custom-btn-step3',
        title: 'Last Step',
        content: 'And custom finish button text.',
        finishBtnText: 'Done!',
        prevBtnText: 'Back again',
        withBackdrop: true,
      }
    ]);
  }
}
