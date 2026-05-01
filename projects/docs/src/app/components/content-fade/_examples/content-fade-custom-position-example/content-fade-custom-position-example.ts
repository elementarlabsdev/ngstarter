import { Component } from '@angular/core';
import { ContentFade, ContentFadePosition } from '@ngstarter-ui/components/content-fade';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';
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
