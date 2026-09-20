import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Paginator } from '@ngstarter-ui/components/paginator';

@Component({
    selector: 'app-basic-paginator-example',
  imports: [
    Paginator
  ],
    templateUrl: './basic-paginator-example.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './basic-paginator-example.scss'
})
export class BasicPaginatorExample {

}
