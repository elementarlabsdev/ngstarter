import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-keyboard-navigation-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  templateUrl: './keyboard-navigation-guided-tour-example.html',
})
export class KeyboardNavigationGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'kb-step1',
        title: 'Keyboard Navigation',
        content: 'Focus must be on the page for keyboard navigation to work. Press Start and then use Arrows or Esc.',
        withBackdrop: true,
      },
      {
        anchorId: 'kb-step2',
        title: 'Step 2',
        content: 'Try pressing ArrowLeft to go back or ArrowRight to finish.',
        withBackdrop: true,
      },
      {
        anchorId: 'kb-step3',
        title: 'Final Step',
        content: 'Press Escape to exit the tour.',
        withBackdrop: true,
      }
    ]);
  }
}
