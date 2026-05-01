import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Tab, TabGroup, TabLabel } from '@ngstarter/components/tabs';

@Component({
    selector: 'app-tabs-with-custom-label-template-example',
  imports: [
    Icon,
    Tab,
    TabGroup,
    TabLabel
  ],
    templateUrl: './tabs-with-custom-label-template-example.html',
    styleUrl: './tabs-with-custom-label-template-example.scss'
})
export class TabsWithCustomLabelTemplateExample {

}
