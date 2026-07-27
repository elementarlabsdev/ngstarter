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
      dataUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22320%22%20height%3D%22180%22%20viewBox%3D%220%200%20320%20180%22%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22296%22%20height%3D%22156%22%20rx%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%230078d4%22%20stroke-width%3D%228%22%2F%3E%3Ctext%20x%3D%22160%22%20y%3D%2296%22%20text-anchor%3D%22middle%22%20fill%3D%22%230078d4%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2240%22%20font-weight%3D%22700%22%3EAPPROVED%3C%2Ftext%3E%3C%2Fsvg%3E',
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

  protected readonly uploadedInitials: readonly PdfBuilderSignatureAsset[] = [
    {
      id: 'pavel-initials',
      name: 'P.S.',
      description: 'Saved initials',
      dataUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22120%22%20viewBox%3D%220%200%20200%20120%22%3E%3Crect%20width%3D%22200%22%20height%3D%22120%22%20fill%3D%22transparent%22%2F%3E%3Ctext%20x%3D%22100%22%20y%3D%2264%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%20font-family%3D%22Brush%20Script%20MT%2C%20Segoe%20Script%2C%20cursive%22%20font-size%3D%2252%22%3EP.S.%3C%2Ftext%3E%3C%2Fsvg%3E',
    },
  ];

  protected removeRecipient(recipient: PdfBuilderRecipient): void {
    this.recipients.update(recipients => recipients.filter(item => item.id !== recipient.id));
  }
}
