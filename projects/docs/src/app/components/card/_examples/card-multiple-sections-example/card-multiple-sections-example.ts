import { Component } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import {
  Card,
  CardActions, CardAvatar,
  CardContent,
  CardHeader,
  CardImage,
  CardSubtitle,
  CardTitle
} from '@ngstarter-ui/components/card';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-card-multiple-sections-example',
  imports: [
    Avatar,
    CardContent,
    CardImage,
    CardSubtitle,
    CardTitle,
    CardHeader,
    Card,
    CardActions,
    Button,
    CardAvatar
  ],
  templateUrl: './card-multiple-sections-example.html',
  styleUrl: './card-multiple-sections-example.scss'
})
export class CardMultipleSectionsExample {

}
