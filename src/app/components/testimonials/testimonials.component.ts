import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    Avatar,
    Card,
    CardContent,
    Icon,
  ],
  templateUrl: './testimonials.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {}
