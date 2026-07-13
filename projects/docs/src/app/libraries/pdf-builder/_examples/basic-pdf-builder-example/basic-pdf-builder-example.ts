import { Component, signal } from '@angular/core';
import { PdfBuilder, type PdfBuilderRecipient } from '@ngstarter-ui/components/pdf-builder';

@Component({
  selector: 'app-basic-pdf-builder-example',
  imports: [
    PdfBuilder
  ],
  templateUrl: './basic-pdf-builder-example.html',
  styleUrl: './basic-pdf-builder-example.scss',
})
export class BasicPdfBuilderExample {
  protected readonly recipients = signal<readonly PdfBuilderRecipient[]>([
    {
      id: 'pavel-salauyou',
      name: 'Pavel Salauyou',
      email: 'pavel.salauyou@gmail.com',
      role: 'Signer',
      avatarLabel: 'PS',
      isCurrentUser: true,
    },
    {
      id: 'legal-approver',
      name: 'Legal Approver',
      email: 'legal@example.com',
      role: 'Approver',
      avatarLabel: 'LA',
    },
  ]);

  protected removeRecipient(recipient: PdfBuilderRecipient): void {
    this.recipients.update(recipients => recipients.filter(item => item.id !== recipient.id));
  }
}
