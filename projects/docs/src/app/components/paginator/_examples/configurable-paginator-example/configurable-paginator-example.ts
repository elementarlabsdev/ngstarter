import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { PageEvent, Paginator } from '@ngstarter/components/paginator';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-configurable-paginator-example',
  imports: [
    FormsModule,
    JsonPipe,
    SlideToggle,
    Paginator,
    Input,
    Label,
    FormField,
  ],
  templateUrl: './configurable-paginator-example.html',
  styleUrl: './configurable-paginator-example.scss'
})
export class ConfigurablePaginatorExample {
  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
}
