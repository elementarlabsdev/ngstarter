import { Component } from '@angular/core';
import { ContentFade, ContentFadePosition } from '@ngstarter/components/content-fade';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-content-fade-custom-position-example',
  imports: [
    ContentFade,
    RadioGroup,
    RadioButton,
    FormsModule
  ],
  templateUrl: './content-fade-custom-position-example.html',
  styleUrl: './content-fade-custom-position-example.scss'
})
export class ContentFadeCustomPositionExample {
  position: ContentFadePosition = 'both';
}
