import {Component, signal} from '@angular/core';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelDescription,
  ExpansionPanelHeader,
  ExpansionPanelTitle,
} from '@ngstarter-ui/components/expansion';
import { faqItems } from '../../seo/seo-data';

@Component({
  selector: 'app-faq',
  imports: [
    Accordion,
    ExpansionPanel,
    ExpansionPanelDescription,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
  ],
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  readonly faqs = signal(faqItems);
}
