import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicInputsExample } from '../_examples/basic-inputs-example/basic-inputs-example';
import {
  TextareaAutosizeExample
} from '../_examples/textarea-autosize-example/textarea-autosize-example';
import { ClearButtonExample } from '../_examples/clear-button-example/clear-button-example';
import { DisabledExample } from '../_examples/disabled-example/disabled-example';
import { ErrorMessagesExample } from '../_examples/error-messages-example/error-messages-example';
import {
  InputWithHintsExample
} from '../_examples/input-with-hints-example/input-with-hints-example';
import {
  PrefixesAndSuffixesExample
} from '../_examples/prefixes-and-suffixes-example/prefixes-and-suffixes-example';

@Component({
  imports: [
    Playground,
    BasicInputsExample,
    TextareaAutosizeExample,
    ClearButtonExample,
    DisabledExample,
    ErrorMessagesExample,
    InputWithHintsExample,
    PrefixesAndSuffixesExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
