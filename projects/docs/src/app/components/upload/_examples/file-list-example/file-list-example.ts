import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { File, FileControl, FileList } from '@ngstarter-ui/components/upload';

export interface FileInterface {
  name: string;
  state: 'uploaded' | 'uploading' | 'error';
  processing?: boolean;
  errorMessage?: string;
  remainingTime?: string;
  size?: string;
  progress?: number;
  type: string;
}

@Component({
  selector: 'app-file-list-example',
  imports: [
    Icon,
    File,
    FileList,
    FileControl
  ],
  templateUrl: './file-list-example.html',
  styleUrl: './file-list-example.scss'
})
export class FileListExample {
  fileList: FileInterface[] = [
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
}
