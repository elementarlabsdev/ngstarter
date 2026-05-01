import { Component } from '@angular/core';

export interface File {
  name: string;
  state: 'uploaded' | 'uploading' | 'error';
  processing?: boolean;
  errorMessage?: string;
  remainingTime?: string;
  size?: string;
  progress?: number;
  type: string;
}

import {
  FileIconDirective,
  FilesGrid,
  GridFile,
  GridFileControlDirective
} from '@ngstarter/components/upload';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-file-grid-example',
  imports: [
    FilesGrid,
    GridFile,
    Icon,
    GridFileControlDirective,

    FileIconDirective,
    Button
  ],
  templateUrl: './file-grid-example.html',
  styleUrl: './file-grid-example.scss'
})
export class FileGridExample {
  fileList: File[] = [
    {
      name: 'Annual Report.docx',
      state: 'uploaded',
      processing: false,
      type: 'doc'
    },
    {
      name: 'Workflow.pdf',
      state: 'uploading',
      processing: false,
      remainingTime: '(remaining time: 00:2:01)',
      size: '11MB',
      progress: 60,
      type: 'pdf'
    },
    {
      name: 'Financials.xlsx',
      state: 'error',
      errorMessage: 'An error occurred',
      type: 'xls'
    }
  ];

  delete(index: number) {
    this.fileList.splice(index, 1);
  }
}
