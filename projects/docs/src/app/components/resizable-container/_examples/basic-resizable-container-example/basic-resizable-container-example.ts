import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ResizableContainer } from '@ngstarter-ui/components/resizable-container';

@Component({
  selector: 'app-basic-resizable-container-example',
  imports: [
    ResizableContainer
  ],
  templateUrl: './basic-resizable-container-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-resizable-container-example.scss'
})
export class BasicResizableContainerExample {

}
