import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-backdrop-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  templateUrl: './backdrop-guided-tour-example.html',
  styleUrl: './backdrop-guided-tour-example.scss',
})
export class BackdropGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'level1',
        title: 'Level 1',
        content: 'You can now click the button inside this block even with backdrop!',
        withBackdrop: true
      },
      {
        anchorId: 'level2',
        title: 'Level 2',
        content: 'Interaction is disabled for this step.',
        withBackdrop: true,
        disableInteraction: true
      },
      {
        anchorId: 'level3',
        title: 'Level 3',
        content: 'This block is also interactive.',
        withBackdrop: true
      }
    ]);
  }

  onLevel1Click(): void {
    alert('Button clicked!');
  }
}
