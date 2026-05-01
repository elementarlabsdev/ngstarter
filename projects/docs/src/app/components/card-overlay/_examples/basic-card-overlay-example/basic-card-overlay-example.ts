import { Component } from '@angular/core';
import {
  Card,
  CardActions,
  CardAvatar,
  CardContent,
  CardHeader,
  CardImage, CardSubtitle, CardTitle
} from '@ngstarter-ui/components/card';
import { CardOverlay, CardOverlayContainerDirective } from '@ngstarter-ui/components/card-overlay';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-card-overlay-example',
  imports: [
    Card,
    CardContent,
    CardOverlay,
    Button,
    CardOverlayContainerDirective,
    Avatar,
    CardActions,
    CardAvatar,
    CardHeader,
    CardImage,
    CardSubtitle,
    CardTitle,
    CardOverlayContainerDirective
  ],
  templateUrl: './basic-card-overlay-example.html',
  styleUrl: './basic-card-overlay-example.scss'
})
export class BasicCardOverlayExample {

}
