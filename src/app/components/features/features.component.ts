import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  templateUrl: './features.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {}
