import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Card, CardContent, CardActions } from '@ngstarter-ui/components/card';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-card-example',
  imports: [
    CardContent,
    CardActions,
    Card,
    Button
  ],
  templateUrl: './basic-card-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-card-example.scss'
})
export class BasicCardExample {

}
