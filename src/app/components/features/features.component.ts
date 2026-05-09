import { Component } from '@angular/core';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    Card,
    CardContent,
    Icon,
  ],
  templateUrl: './features.component.html'
})
export class FeaturesComponent {}
