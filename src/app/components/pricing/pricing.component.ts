import { Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [Button, Card, CardContent, Icon],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  readonly showIntro = input(true);
  readonly embedded = input(false);
}
