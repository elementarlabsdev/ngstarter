import { Component, inject } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-guided-tour-example',
  imports: [TourAnchorDirective, Button],
  templateUrl: './basic-guided-tour-example.html',
  styleUrl: './basic-guided-tour-example.scss',
})
export class BasicGuidedTourExample {
  private readonly tourService = inject(TourService);

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'collapse-sidebar',
        title: 'Collapse Sidebar',
        content: 'This is the first step of the tour.',
        onShow: () => console.log('Collapse Sidebar 1 show'),
        onHide: () => console.log('Collapse Sidebar 1 hide'),
        onNext: () => console.log('Collapse Sidebar 1 next'),
        withBackdrop: true,
        disableInteraction: true,
      },
      {
        anchorId: 'step1',
        title: 'Step 1',
        content: 'This is the first step of the tour.',
        onShow: () => console.log('Step 1 show'),
        onHide: () => console.log('Step 1 hide'),
        onNext: () => console.log('Step 1 next'),
      },
      {
        anchorId: 'step2',
        title: 'Step 2',
        content: 'This is the second step without backdrop.',
        onShow: () => console.log('Step 2 show'),
        onHide: () => console.log('Step 2 hide'),
        onNext: () => console.log('Step 2 next'),
        onPrev: () => console.log('Step 2 prev'),
      },
      {
        anchorId: 'step3',
        title: 'Step 3',
        content: 'This is the third and final step of the tour.',
        onShow: () => console.log('Step 3 show'),
        onHide: () => console.log('Step 3 hide'),
        onPrev: () => console.log('Step 3 prev'),
      },
      {
        anchorId: () => document.querySelector('.dynamic-anchor') as HTMLElement,
        title: 'Dynamic Step',
        content: 'This step uses a dynamic anchorId function.',
        withBackdrop: true
      }
    ]);
  }
}
