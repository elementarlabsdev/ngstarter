import { Component } from '@angular/core';
import { PricingComponent } from '../../components/pricing/pricing.component';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [
    PricingComponent,
  ],
  templateUrl: './pricing.html',
})
export class Pricing {}
