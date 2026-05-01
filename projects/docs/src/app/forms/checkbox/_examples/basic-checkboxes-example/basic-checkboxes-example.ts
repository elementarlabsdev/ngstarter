import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '@ngstarter/components/checkbox';

export interface Task {
  name: string;
  completed: boolean;
  color: any;
  subtasks?: Task[];
}

@Component({
  selector: 'app-basic-checkboxes-example',
  imports: [
    FormsModule,
    Checkbox
  ],
  templateUrl: './basic-checkboxes-example.html',
  styleUrl: './basic-checkboxes-example.scss'
})
export class BasicCheckboxesExample {
  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      {name: 'Primary', completed: false, color: 'primary'},
      {name: 'Accent', completed: false, color: 'accent'},
      {name: 'Warn', completed: false, color: 'warn'},
    ],
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
  }
}
