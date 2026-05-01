import { Component } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { CardOverlay, CardOverlayContainerDirective } from '@ngstarter-ui/components/card-overlay';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardActions,
  CardAvatar,
  CardContent,
  CardHeader,
  CardImage, CardSubtitle, CardTitle
} from '@ngstarter-ui/components/card';

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
