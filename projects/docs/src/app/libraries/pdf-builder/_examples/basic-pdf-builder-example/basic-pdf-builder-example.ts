import { Component, signal } from '@angular/core';
import {
  PdfBuilder,
  type PdfBuilderRecipient,
  type PdfBuilderSigner,
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

  protected readonly signers: readonly PdfBuilderSigner[] = [
    {
      id: 'pavel-salauyou',
      fullName: 'Pavel Salauyou',
      email: 'pavel.salauyou@gmail.com',
    },
  ];

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
      dataUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22320%22%20height%3D%22120%22%20viewBox%3D%220%200%20320%20120%22%3E%3Crect%20width%3D%22320%22%20height%3D%22120%22%20fill%3D%22transparent%22%2F%3E%3Ctext%20x%3D%22160%22%20y%3D%2266%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%20font-family%3D%22Brush%20Script%20MT%2C%20Segoe%20Script%2C%20cursive%22%20font-size%3D%2248%22%3EPavel%3C%2Ftext%3E%3C%2Fsvg%3E',
    },
  ];

  protected removeRecipient(recipient: PdfBuilderRecipient): void {
    this.recipients.update(recipients => recipients.filter(item => item.id !== recipient.id));
  }
}
