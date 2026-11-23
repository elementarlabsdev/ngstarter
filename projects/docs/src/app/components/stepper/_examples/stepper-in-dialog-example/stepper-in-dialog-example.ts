import { Component, inject, signal, TemplateRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form, email, required } from '@angular/forms/signals';
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
    SignalFormField,
    Step,
    StepLabel,
    Stepper,
  ],
  templateUrl: './stepper-in-dialog-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './stepper-in-dialog-example.scss',
})
export class StepperInDialogExample {
  private readonly dialog = inject(Dialog);
  private readonly setupDialog = viewChild.required<TemplateRef<unknown>>('setupDialog');

  readonly result = signal<string | null>(null);

  readonly workspaceForm = form(signal({
    workspaceName: 'Atlas Operations',
    slug: 'atlas-ops',
    region: 'Europe / Warsaw',
    owner: 'Maya Chen',
    workspaceType: 'Operations hub',
    environment: 'Production',
    primaryDomain: 'atlas.example.com',
    defaultLanguage: 'English',
    complianceTier: 'SOC 2',
    backupWindow: '02:00-04:00 UTC',
    lifecycleStage: 'Implementation',
    analyticsWorkspace: 'Atlas BI',
    billingAccount: 'BA-1048',
    costCenter: 'OPS-240',
    businessUnit: 'Global Operations',
    contactEmail: 'workspace-admin@example.com',
    escalationChannel: '#atlas-escalations',
    description: 'Central workspace for operations planning, billing approvals, and weekly execution reviews.',
  }), (path) => {
    required(path.workspaceName);
    required(path.slug);
    required(path.region);
    required(path.owner);
    required(path.workspaceType);
    required(path.environment);
    required(path.primaryDomain);
    required(path.defaultLanguage);
    required(path.complianceTier);
    required(path.backupWindow);
    required(path.lifecycleStage);
    required(path.analyticsWorkspace);
    required(path.billingAccount);
    required(path.costCenter);
    required(path.businessUnit);
    required(path.contactEmail);
    email(path.contactEmail);
    required(path.description);
  });

  readonly accessForm = form(signal({
    adminEmail: 'maya.chen@example.com',
    team: 'Operations',
    seats: '24',
    defaultRole: 'Editor',
    invitationNote: 'Invite regional leads first, then add finance reviewers after launch.',
  }), (path) => {
    required(path.adminEmail);
    email(path.adminEmail);
    required(path.seats);
    required(path.defaultRole);
  });

  readonly launchForm = form(signal({
    checklistOwner: 'Jordan Lee',
    launchDate: '2026-07-01',
    supportChannel: '#atlas-support',
    notes: 'Confirm billing limits and dashboard permissions before sending invitations.',
  }), (path) => {
    required(path.checklistOwner);
    required(path.launchDate);
    required(path.supportChannel);
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
      return this.workspaceForm().valid();
    }

    if (selectedIndex === 1) {
      return this.accessForm().valid();
    }

    return false;
  }

  canFinish(): boolean {
    return this.workspaceForm().valid() && this.accessForm().valid() && this.launchForm().valid();
  }
}
