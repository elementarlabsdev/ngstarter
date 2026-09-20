import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RadioButton, RadioGroup } from '@ngstarter-ui/components/radio';

@Component({
    selector: 'app-basic-radio-example',
    imports: [
        RadioButton,
        RadioGroup
    ],
    templateUrl: './basic-radio-example.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './basic-radio-example.scss'
})
export class BasicRadioExample {

}
