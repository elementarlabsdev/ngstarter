import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardActions, CardHeader, CardSubtitle, CardTitle } from '@ngstarter-ui/components/card';

@Component({
    selector: 'app-card-actions-example',
  imports: [
    Button,
    CardActions,
    CardSubtitle,
    CardTitle,
    CardHeader,
    Card
  ],
  templateUrl: './card-actions-example.html',
  styleUrl: './card-actions-example.scss'
})
export class CardActionsExample {

}
