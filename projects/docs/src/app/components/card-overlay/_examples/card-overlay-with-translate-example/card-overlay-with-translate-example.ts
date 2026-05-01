import { Component } from '@angular/core';
import { Avatar } from '@ngstarter/components/avatar';
import { CardOverlay, CardOverlayContainerDirective } from '@ngstarter/components/card-overlay';
import { Button } from '@ngstarter/components/button';
import {
  Card,
  CardActions,
  CardAvatar,
  CardContent,
  CardHeader,
  CardImage, CardSubtitle, CardTitle
} from '@ngstarter/components/card';

@Component({
  selector: 'app-card-overlay-with-translate-example',
  imports: [
    Avatar,
    CardOverlay,
    CardOverlayContainerDirective,
    Button,
    Card,
    CardActions,
    CardAvatar,
    CardContent,
    CardHeader,
    CardImage,
    CardSubtitle,
    CardTitle
  ],
  templateUrl: './card-overlay-with-translate-example.html',
  styleUrl: './card-overlay-with-translate-example.scss'
})
export class CardOverlayWithTranslateExample {

}
