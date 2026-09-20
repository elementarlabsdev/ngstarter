import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle,
} from '@ngstarter-ui/components/expansion';
import { faqItems } from '../../seo/seo-data';

@Component({
  selector: 'app-faq',
  imports: [
    Accordion,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  readonly faqs = signal(faqItems);
}
