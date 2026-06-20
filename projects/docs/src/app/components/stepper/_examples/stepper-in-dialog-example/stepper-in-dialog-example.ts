import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@ngstarter-ui/components/dialog';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Step, StepLabel, Stepper } from '@ngstarter-ui/components/stepper';

@Component({
  selector: 'app-stepper-in-dialog-example',
  imports: [
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    Step,
    StepLabel,
    Stepper,
  ],
  templateUrl: './stepper-in-dialog-example.html',
  styleUrl: './stepper-in-dialog-example.scss',
})
export class StepperInDialogExample {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(Dialog);
  private readonly setupDialog = viewChild.required<TemplateRef<unknown>>('setupDialog');

  readonly result = signal<string | null>(null);

  readonly workspaceForm = this.formBuilder.group({
    workspaceName: ['Atlas Operations', Validators.required],
    slug: ['atlas-ops', Validators.required],
    region: ['Europe / Warsaw', Validators.required],
    owner: ['Maya Chen', Validators.required],
    description: [
      'Central workspace for operations planning, billing approvals, and weekly execution reviews.',
      Validators.required,
    ],
  });

  readonly accessForm = this.formBuilder.group({
    adminEmail: ['maya.chen@example.com', [Validators.required, Validators.email]],
    team: ['Operations'],
    seats: ['24', Validators.required],
    defaultRole: ['Editor', Validators.required],
    invitationNote: ['Invite regional leads first, then add finance reviewers after launch.'],
  });

  readonly launchForm = this.formBuilder.group({
    checklistOwner: ['Jordan Lee', Validators.required],
    launchDate: ['2026-07-01', Validators.required],
    supportChannel: ['#atlas-support', Validators.required],
    notes: ['Confirm billing limits and dashboard permissions before sending invitations.'],
  });

  openDialog(): void {
    const dialogRef = this.dialog.open<unknown, unknown, string>(this.setupDialog(), {
      width: '760px',
      maxWidth: '760px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.result.set(result ?? 'Setup was closed');
    });
  }

  canMoveNext(selectedIndex: number): boolean {
    if (selectedIndex === 0) {
      return this.workspaceForm.valid;
    }

    if (selectedIndex === 1) {
      return this.accessForm.valid;
    }

    return false;
  }

  canFinish(): boolean {
    return this.workspaceForm.valid && this.accessForm.valid && this.launchForm.valid;
  }
}
