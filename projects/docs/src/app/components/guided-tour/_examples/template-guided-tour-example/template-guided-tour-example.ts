import { Component, inject, viewChild, TemplateRef } from '@angular/core';
import { TourService, TourAnchorDirective } from '@ngstarter-ui/components/guided-tour';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-template-guided-tour-example',
  standalone: true,
  imports: [TourAnchorDirective, Button],
  templateUrl: './template-guided-tour-example.html',
})
export class TemplateGuidedTourExample {
  readonly tourService = inject(TourService);
  customStepTemplate = viewChild.required<TemplateRef<any>>('customStepTemplate');

  startTour(): void {
    this.tourService.start([
      {
        anchorId: 'html-step',
        title: 'HTML Content',
        htmlContent: '<p>This step uses <strong>HTML</strong> string for content.</p><ul class="list-disc ml-4 mt-2"><li>Feature 1</li><li>Feature 2</li></ul>',
        withBackdrop: true,
      },
      {
        anchorId: 'template-step',
        title: 'TemplateRef Content',
        template: this.customStepTemplate(),
        templateContext: { name: 'User' },
        withBackdrop: true,
      }
    ]);
  }
}
