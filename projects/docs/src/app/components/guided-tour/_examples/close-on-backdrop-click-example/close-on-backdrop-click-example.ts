import { Component, inject } from '@angular/core';
import { TourService } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-close-on-backdrop-click-example',
  imports: [Button],
  templateUrl: './close-on-backdrop-click-example.html',
})
export class CloseOnBackdropClickExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: '#close-step1',
        title: 'Step 1',
        content: 'Click on the backdrop to close the tour.',
        withBackdrop: true,
        closeOnBackdropClick: true
      },
      {
        anchorId: '#close-step2',
        title: 'Step 2',
        content: 'This step also can be closed by clicking on the backdrop.',
        withBackdrop: true,
        closeOnBackdropClick: true
      }
    ]);
  }
}
