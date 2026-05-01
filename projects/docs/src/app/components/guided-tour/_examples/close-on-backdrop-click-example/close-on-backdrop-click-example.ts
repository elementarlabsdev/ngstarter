import { Component, inject } from '@angular/core';
import { TourService } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-close-on-backdrop-click-example',
  imports: [Button],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <button ngsButton="filled" (click)="startTour()">Start Tour (Close on Backdrop Click)</button>
      </div>

      <div class="flex gap-10 mt-10">
        <div id="close-step1" class="p-4 border rounded">Step 1</div>
        <div id="close-step2" class="p-4 border rounded">Step 2</div>
      </div>
    </div>
  `,
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
