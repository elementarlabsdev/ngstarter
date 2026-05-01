import { Component } from '@angular/core';
import { Card, CardContent, CardActions, CardHeader, CardSubtitle, CardTitle } from '@ngstarter/components/card';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-card-appearance-example',
  imports: [
    Card,
    CardContent,
    CardActions,
    CardHeader,
    CardTitle,
    CardSubtitle,
    Button,
  ],
  templateUrl: './card-appearance-example.html',
  styleUrl: './card-appearance-example.scss'
})
export class CardAppearanceExample {

}
