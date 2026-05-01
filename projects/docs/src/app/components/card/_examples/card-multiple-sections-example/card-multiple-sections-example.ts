import { Component } from '@angular/core';
import { Avatar } from '@ngstarter/components/avatar';
import {
  Card,
  CardActions, CardAvatar,
  CardContent,
  CardHeader,
  CardImage,
  CardSubtitle,
  CardTitle
} from '@ngstarter/components/card';
import { Button } from '@ngstarter/components/button';

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
