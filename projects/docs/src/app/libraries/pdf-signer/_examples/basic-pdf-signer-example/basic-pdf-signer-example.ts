import { Component, signal } from '@angular/core';
import {
  type PdfBuilderField,
  type PdfBuilderSchema,
  type PdfBuilderSigner,
  type PdfBuilderSignatureAsset,
  type PdfBuilderStampAsset,
} from '@ngstarter-ui/components/pdf-builder';
import { PdfSigner } from '@ngstarter-ui/components/pdf-signer';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-pdf-signer-example',
  imports: [Button, PdfSigner],
  templateUrl: './basic-pdf-signer-example.html',
})
export class BasicPdfSignerExample {
  protected readonly currentSigner: PdfBuilderSigner = {
    id: 'signer-current',
    fullName: 'Current Signer',
    email: 'current@example.com',
  };
  protected readonly showOtherSignerFields = signal(true);
  protected readonly stamps: readonly PdfBuilderStampAsset[] = [
    {
      id: 'approved',
      name: 'Approved',
      description: 'Approval stamp',
      dataUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22320%22%20height%3D%22180%22%20viewBox%3D%220%200%20320%20180%22%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22296%22%20height%3D%22156%22%20rx%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%230078d4%22%20stroke-width%3D%228%22%2F%3E%3Ctext%20x%3D%22160%22%20y%3D%2296%22%20text-anchor%3D%22middle%22%20fill%3D%22%230078d4%22%20font-family%3D%22Arial%2Csans-serif%22%20font-size%3D%2240%22%20font-weight%3D%22700%22%3EAPPROVED%3C%2Ftext%3E%3C%2Fsvg%3E',
    },
  ];
  protected readonly uploadedSignatures: readonly PdfBuilderSignatureAsset[] = [
    {
      id: 'current-signature',
      name: 'Current Signer',
      description: 'Saved signature',
    },
  ];
  protected readonly uploadedInitials: readonly PdfBuilderSignatureAsset[] = [
    {
      id: 'current-initials',
      name: 'C.S.',
      description: 'Saved initials',
    },
  ];
  protected readonly schema = signal<PdfBuilderSchema>(this.createSchema());

  private createSchema(): PdfBuilderSchema {
    const otherSigner: PdfBuilderSigner = {
      id: 'signer-other',
      fullName: 'Other Signer',
      email: 'other@example.com',
    };

    return {
      version: 1,
      document: {
        name: 'Prepared agreement.pdf',
        source: null,
        sizeLabel: 'Virtual PDF',
        sourcePageCount: 0,
        addedPageCount: 3,
        pages: [
          {
            id: 'virtual-1',
            kind: 'virtual',
            label: 'Page 1',
            width: 595.276,
            height: 841.89,
          },
          {
            id: 'virtual-2',
            kind: 'virtual',
            label: 'Page 2',
            width: 595.276,
            height: 841.89,
          },
          {
            id: 'virtual-3',
            kind: 'virtual',
            label: 'Page 3',
            width: 595.276,
            height: 841.89,
          },
        ],
      },
      view: {
        activePage: 1,
        selectedFieldId: null,
        activeCanvasTool: 'select',
        pageStripVisible: false,
        libraryCollapsed: true,
        searchPanelVisible: false,
        annotationsPanelVisible: false,
        spreadMode: 'single',
        scrollLayout: 'vertical',
        pageRotation: 0,
        activeSearchQuery: '',
        expandedLayerNodeIds: [],
      },
      fields: [
        this.createField({
          id: 'signer-name',
          type: 'text',
          label: 'Full name',
          signer: this.currentSigner,
          x: 72,
          y: 128,
          width: 240,
          height: 48,
        }),
        this.createField({
          id: 'signer-date',
          type: 'date',
          label: 'Signing date',
          signer: this.currentSigner,
          icon: 'fluent:calendar-ltr-24-regular',
          slot: 'date',
          x: 72,
          y: 208,
          width: 180,
          height: 40,
        }),
        this.createField({
          id: 'other-signer-name',
          type: 'text',
          label: 'Other signer',
          signer: otherSigner,
          value: 'Other Signer',
          x: 72,
          y: 320,
          width: 240,
          height: 48,
        }),
        this.createField({
          id: 'terms-confirmed',
          type: 'checkbox',
          label: 'Accept terms',
          signer: this.currentSigner,
          page: 2,
          icon: 'fluent:checkbox-checked-24-regular',
          slot: 'checkbox',
          x: 72,
          y: 128,
          width: 20,
          height: 20,
        }),
        this.createField({
          id: 'signer-signature',
          type: 'signature',
          label: 'Signature',
          signer: this.currentSigner,
          page: 2,
          icon: 'fluent:signature-24-regular',
          slot: 'signature',
          x: 72,
          y: 216,
          width: 240,
          height: 72,
        }),
        this.createField({
          id: 'signer-initials',
          type: 'initials',
          label: 'Initials',
          signer: this.currentSigner,
          page: 3,
          icon: 'fluent:text-font-24-regular',
          slot: 'initials',
          x: 72,
          y: 128,
          width: 128,
          height: 56,
        }),
        this.createField({
          id: 'approval-stamp',
          type: 'stamp',
          label: 'Approval stamp',
          signer: this.currentSigner,
          page: 3,
          icon: 'fluent:stamp-32-light',
          slot: 'primary',
          x: 72,
          y: 232,
          width: 180,
          height: 64,
        }),
      ],
    };
  }

  private createField(
    field: Partial<PdfBuilderField> &
      Pick<PdfBuilderField, 'id' | 'type' | 'label' | 'signer' | 'x' | 'y' | 'width' | 'height'>,
  ): PdfBuilderField {
    return {
      page: 1,
      binding: '',
      value: '',
      icon: 'fluent:text-font-24-regular',
      slot: 'primary',
      required: true,
      readonly: false,
      locked: false,
      ...field,
    };
  }
}
