import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    Button,
    Card,
    CardContent,
    Icon,
    RouterLink,
  ],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {}
