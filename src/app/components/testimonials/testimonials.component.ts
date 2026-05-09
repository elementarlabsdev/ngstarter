import { Component } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    Dicebear,
    Card,
    CardContent,
    Icon,
  ],
  templateUrl: './testimonials.component.html'
})
export class TestimonialsComponent {}
