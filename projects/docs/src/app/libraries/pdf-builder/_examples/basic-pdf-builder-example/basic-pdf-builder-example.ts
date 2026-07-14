import { Component, signal } from '@angular/core';
import {
  PdfBuilder,
  type PdfBuilderRecipient,
  type PdfBuilderSignatureAsset,
  type PdfBuilderStampAsset,
} from '@ngstarter-ui/components/pdf-builder';

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

  protected readonly stamps: readonly PdfBuilderStampAsset[] = [
    {
      id: 'company-stamp',
      name: 'Company stamp',
      description: 'Uploaded stamp',
    },
  ];

  protected readonly uploadedSignatures: readonly PdfBuilderSignatureAsset[] = [
    {
      id: 'pavel-signature',
      name: 'Pavel signature',
      description: 'Saved signature',
    },
  ];

  protected removeRecipient(recipient: PdfBuilderRecipient): void {
    this.recipients.update(recipients => recipients.filter(item => item.id !== recipient.id));
  }
}
