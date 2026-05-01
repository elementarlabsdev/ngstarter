import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { PreviewComponent } from '../../components/preview/preview.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { UpgradeComponent } from '../../components/upgrade/upgrade.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    FeaturesComponent,
    PreviewComponent,
    PricingComponent,
    TestimonialsComponent,
    UpgradeComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
