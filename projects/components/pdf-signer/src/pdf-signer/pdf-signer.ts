import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  RendererStyleFlags2,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Datepicker,
  DatepickerInput,
  provideNativeDateAdapter,
} from '@ngstarter-ui/components/datepicker';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Icon } from '@ngstarter-ui/components/icon';
import { Panel, PanelContent, PanelHeader, PanelSidebar } from '@ngstarter-ui/components/panel';
import {
  PDF_BUILDER_DEFAULT_TEXT_FONT_COLOR,
  PDF_BUILDER_DEFAULT_TEXT_FONT_FAMILY,
  PDF_BUILDER_DEFAULT_TEXT_FONT_SIZE,
  PDF_BUILDER_MAX_TEXT_FONT_SIZE,
  PDF_BUILDER_MIN_TEXT_FONT_SIZE,
  type PdfBuilderDrawnSignatureUploadCallback,
  type PdfBuilderField,
  type PdfBuilderInitialsAsset,
  type PdfBuilderInitialsSelection,
  type PdfBuilderInitialsType,
  PdfBuilderSignatureDialog,
  type PdfBuilderSignatureDialogData,
  type PdfBuilderSignatureDialogResult,
  type PdfBuilderSignatureAsset,
  type PdfBuilderSignatureImageUploadCallback,
  type PdfBuilderSignatureSelection,
  type PdfBuilderSignatureType,
  type PdfBuilderSignatureUpload,
  type PdfBuilderSignatureUploadCallbackResult,
  type PdfBuilderInitialsImageUploadCallback,
  type PdfBuilderInitialsUpload,
  type PdfBuilderSchema,
  type PdfBuilderSchemaPage,
  type PdfBuilderSigner,
  type PdfBuilderStampAsset,
  PdfBuilderStampDialog,
  type PdfBuilderStampDialogResult,
  type PdfBuilderStampSelection,
  type PdfBuilderStampUpload,
} from '@ngstarter-ui/components/pdf-builder';
import {
  PdfViewer,
  type PdfViewerLoadedEvent,
  type PdfViewerSource,
} from '@ngstarter-ui/components/pdf-viewer';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Toolbar, ToolbarItem, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

const PDF_SIGNER_PAGE_WIDTH = 595.276;
const PDF_SIGNER_PAGE_HEIGHT = 841.89;
const PDF_SIGNER_MAX_PORTRAIT_PAGE_WIDTH = 814;
const PDF_SIGNER_FIXED_PAGE_SCALE = PDF_SIGNER_MAX_PORTRAIT_PAGE_WIDTH / PDF_SIGNER_PAGE_WIDTH;

interface PdfSignerPage {
  readonly page: number;
  readonly label: string;
  readonly kind: 'source' | 'virtual';
  readonly sourcePage: number | null;
}

interface PdfSignerPageSpread {
  readonly id: string;
  readonly leadingPlaceholder: boolean;
  readonly pages: readonly PdfSignerPage[];
}

export interface PdfSignerFieldValueChange {
  readonly field: PdfBuilderField;
  readonly previousValue: string;
  readonly value: string;
  readonly schema: PdfBuilderSchema;
}

@Component({
  selector: 'ngs-pdf-signer',
  exportAs: 'ngsPdfSigner',
  imports: [
    Button,
    Datepicker,
    DatepickerInput,
    Icon,
    Panel,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    PdfViewer,
    ScrollbarArea,
    Toolbar,
    ToolbarItem,
    ToolbarSpacer,
    Tooltip,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './pdf-signer.html',
  styleUrl: './pdf-signer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-signer not-prose',
  },
})
export class PdfSigner {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(Dialog);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private lastEmittedSchema: PdfBuilderSchema | null = null;

  readonly schema = input<PdfBuilderSchema | null>(null);
  readonly signer = input<PdfBuilderSigner | null>(null);
  readonly showPageList = input(true, { transform: booleanAttribute });
  readonly showOtherSignerFields = input(true);
  readonly stamps = input<readonly PdfBuilderStampAsset[]>([]);
  readonly uploadedSignatures = input<readonly PdfBuilderSignatureAsset[]>([]);
  readonly uploadedInitials = input<readonly PdfBuilderInitialsAsset[]>([]);
  readonly drawnSignatureUploadCallback = input<PdfBuilderDrawnSignatureUploadCallback | null | undefined>(undefined);
  readonly signatureImageUploadCallback = input<PdfBuilderSignatureImageUploadCallback | null | undefined>(undefined);
  readonly initialsImageUploadCallback = input<PdfBuilderInitialsImageUploadCallback | null | undefined>(undefined);

  readonly schemaChange = output<PdfBuilderSchema>();
  readonly fieldValueChange = output<PdfSignerFieldValueChange>();
  readonly stampSelected = output<PdfBuilderStampSelection>();
  readonly stampUploaded = output<PdfBuilderStampUpload>();
  readonly signatureSelected = output<PdfBuilderSignatureSelection>();
  readonly signatureUploaded = output<PdfBuilderSignatureUpload>();
  readonly signatureDrawn = output<{
    readonly field: PdfBuilderField;
    readonly dataUrl: string;
  }>();
  readonly signatureTyped = output<PdfBuilderSignatureType>();
  readonly initialsSelected = output<PdfBuilderInitialsSelection>();
  readonly initialsUploaded = output<PdfBuilderInitialsUpload>();
  readonly initialsTyped = output<PdfBuilderInitialsType>();

  protected readonly dateFieldPicker = viewChild<Datepicker<Date>>('dateFieldPicker');
  protected readonly dateFieldInput = viewChild<DatepickerInput<Date>>('dateFieldInput');
  protected readonly viewerScrollbar = viewChild<ScrollbarArea>('viewerScrollbar');
  protected readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';
  protected readonly pdfScale = signal(PDF_SIGNER_FIXED_PAGE_SCALE);
  protected readonly textFieldPlaceholder = 'Enter value';
  protected readonly documentPages = signal<readonly PdfBuilderSchemaPage[]>([
    this.createVirtualPage(1),
  ]);
  protected readonly fields = signal<readonly PdfBuilderField[]>([]);
  protected readonly activePage = signal(1);

  protected readonly documentName = computed(() => this.schema()?.document.name ?? 'Untitled.pdf');
  protected readonly documentSource = computed<PdfViewerSource>(() => this.schema()?.document.source ?? null);
  protected readonly pageCount = computed(() => this.documentPages().length);
  protected readonly spreadMode = computed(() => this.schema()?.view.spreadMode ?? 'single');
  protected readonly scrollLayout = computed(() => this.schema()?.view.scrollLayout ?? 'vertical');
  protected readonly pageRotation = computed(() => this.schema()?.view.pageRotation ?? 0);
  protected readonly canGoPrevious = computed(() => this.activePage() > 1);
  protected readonly canGoNext = computed(() => this.activePage() < this.pageCount());
  protected readonly currentSignerFieldCount = computed(() =>
    this.fields().filter(field => this.isOwnedByCurrentSigner(field)).length,
  );
  protected readonly completedCurrentSignerFieldCount = computed(() =>
    this.fields().filter(field => this.isOwnedByCurrentSigner(field) && this.isFieldFilled(field)).length,
  );
  protected readonly nextIncompleteField = computed(() =>
    [...this.fields()]
      .filter(field => this.isFieldInteractive(field) && !this.isFieldFilled(field))
      .sort((left, right) =>
        left.page - right.page ||
        left.y - right.y ||
        left.x - right.x ||
        left.id.localeCompare(right.id),
      )[0] ?? null,
  );

  protected readonly pages = computed<readonly PdfSignerPage[]>(() =>
    this.documentPages().map((schemaPage, index) => {
      const page = index + 1;

      return {
        page,
        label: schemaPage.label ?? `Page ${page}`,
        kind: schemaPage.kind,
        sourcePage: schemaPage.kind === 'source' ? schemaPage.sourcePage ?? page : null,
      };
    }),
  );
  protected readonly pageSpreads = computed<readonly PdfSignerPageSpread[]>(() =>
    this.groupPagesIntoSpreads(this.pages(), this.spreadMode()),
  );

  constructor() {
    effect(() => {
      const schema = this.schema();

      if (!schema || schema === this.lastEmittedSchema) {
        return;
      }

      untracked(() => this.restoreSchema(schema));
    });

    effect(() => {
      this.documentPages();
      this.pdfScale();
      this.pageRotation();

      this.scheduleDomSync(() => this.syncPageGeometry());
    });

    effect(() => {
      this.fields();
      this.showOtherSignerFields();
      this.signer();
      this.pdfScale();

      this.scheduleDomSync(() => this.syncOverlayGeometry());
    });
  }

  protected pageFields(pageNumber: number): readonly PdfBuilderField[] {
    return this.fields().filter(field =>
      field.page === pageNumber &&
      (this.showOtherSignerFields() || this.isOwnedByCurrentSigner(field)),
    );
  }

  protected isFieldEditable(field: PdfBuilderField): boolean {
    return this.isOwnedByCurrentSigner(field) && !field.locked && !field.readonly;
  }

  protected isFieldInteractive(field: PdfBuilderField): boolean {
    return this.isFieldEditable(field) && field.type !== 'variable';
  }

  protected isButtonActionField(field: PdfBuilderField): boolean {
    return this.isFieldInteractive(field) && field.type !== 'text';
  }

  protected isFieldFilled(field: PdfBuilderField): boolean {
    if (field.type === 'checkbox') {
      return this.isCheckboxChecked(field);
    }

    if (field.type === 'signature' || field.type === 'initials') {
      return !!field.value.trim() && field.value !== (field.type === 'signature' ? 'Signature' : 'Initials');
    }

    return field.value.trim().length > 0;
  }

  protected isCheckboxChecked(field: PdfBuilderField): boolean {
    return ['true', 'checked', '1', 'yes', 'on'].includes(field.value.trim().toLocaleLowerCase());
  }

  protected getFieldDisplayValue(field: PdfBuilderField): string {
    if (field.type === 'text') {
      return field.value.trim() || this.textFieldPlaceholder;
    }

    if (field.type === 'date') {
      return field.value.trim() || 'Select date';
    }

    if (field.type === 'variable') {
      return field.value.trim() || (field.binding ? `{{${field.binding}}}` : field.label);
    }

    return field.value.trim() || field.label;
  }

  private getTextFieldFontSize(field: PdfBuilderField): number {
    const fontSize = field.fontSize;

    return typeof fontSize === 'number' && Number.isFinite(fontSize)
      ? this.clamp(fontSize, PDF_BUILDER_MIN_TEXT_FONT_SIZE, PDF_BUILDER_MAX_TEXT_FONT_SIZE)
      : PDF_BUILDER_DEFAULT_TEXT_FONT_SIZE;
  }

  private getTextFieldFontFamily(field: PdfBuilderField): string {
    return field.fontFamily?.trim() || PDF_BUILDER_DEFAULT_TEXT_FONT_FAMILY;
  }

  private getTextFieldFontColor(field: PdfBuilderField): string {
    return field.fontColor?.trim() || PDF_BUILDER_DEFAULT_TEXT_FONT_COLOR;
  }

  protected getFieldTooltip(field: PdfBuilderField): string {
    if (!field.signer) {
      return 'This field is not assigned';
    }

    if (!this.isOwnedByCurrentSigner(field)) {
      return `Assigned to ${field.signer.fullName}`;
    }

    if (field.locked) {
      return 'This field is locked';
    }

    if (field.readonly || field.type === 'variable') {
      return 'This field is read only';
    }

    return '';
  }

  protected isImageValue(value: string): boolean {
    const source = value.trim();

    return /^data:image\//i.test(source) ||
      /^blob:/i.test(source) ||
      /^https?:\/\//i.test(source) ||
      source.startsWith('/') ||
      source.startsWith('assets/');
  }

  protected isTypedSignatureImageValue(value: string): boolean {
    return value.trim().toLowerCase().startsWith('data:image/svg+xml');
  }

  protected executeFieldAction(field: PdfBuilderField, event?: Event): void {
    event?.stopPropagation();

    if (!this.isFieldInteractive(field)) {
      return;
    }

    this.activePage.set(field.page);

    switch (field.type) {
      case 'text':
        this.focusTextFieldEditor(field.id);
        return;
      case 'date':
        this.openDateFieldPicker(field);
        return;
      case 'signature':
        this.openSignatureDialog(field);
        return;
      case 'initials':
        this.openInitialsDialog(field);
        return;
      case 'stamp':
        this.openStampDialog(field);
        return;
      case 'checkbox':
        this.updateFieldValue(field.id, this.isCheckboxChecked(field) ? '' : 'true');
        return;
      case 'variable':
        return;
    }
  }

  protected updateTextFieldValueFromEditor(fieldId: string, editor: HTMLElement): void {
    this.updateFieldValue(fieldId, editor.textContent ?? '');
  }

  protected selectPage(pageNumber: number): void {
    const nextPage = this.clamp(Math.floor(pageNumber), 1, Math.max(1, this.pageCount()));

    this.activePage.set(nextPage);
    this.scheduleDomSync(() => {
      this.getPageShellElement(nextPage)?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      });
    });
  }

  protected previousPage(): void {
    this.selectPage(this.activePage() - 1);
  }

  protected nextPage(): void {
    this.selectPage(this.activePage() + 1);
  }

  protected goToField(field: PdfBuilderField, event?: Event): void {
    event?.stopPropagation();

    this.activePage.set(field.page);
    this.scheduleDomSync(() => {
      const fieldElement = this.getOverlayFieldElement(field.id);

      if (!fieldElement) {
        return;
      }

      this.scrollFieldIntoViewport(fieldElement);
      const focusTarget = field.type === 'text'
        ? this.getTextFieldEditorElement(field.id)
        : fieldElement;

      focusTarget?.focus({ preventScroll: true });
    });
  }

  protected isSourcePdfPage(pageNumber: number): boolean {
    return !!this.documentSource() && this.documentPages()[pageNumber - 1]?.kind === 'source';
  }

  protected getSourcePageNumber(pageNumber: number): number {
    return this.documentPages()[pageNumber - 1]?.sourcePage ?? pageNumber;
  }

  protected onPdfLoaded(event: PdfViewerLoadedEvent): void {
    const currentSchema = this.schema();

    if (!currentSchema || currentSchema.document.pages?.length || event.pageCount <= 0) {
      return;
    }

    const virtualPages = this.documentPages().filter(page => page.kind === 'virtual');
    const pages = [
      ...this.createSourcePages(event.pageCount),
      ...virtualPages,
    ];

    this.documentPages.set(pages);
    this.activePage.update(page => this.clamp(page, 1, pages.length));
  }

  private restoreSchema(schema: PdfBuilderSchema): void {
    const pages = this.getSchemaPages(schema);
    const fields = (schema.fields ?? [])
      .filter(field => field.page >= 1 && field.page <= pages.length)
      .map(field => ({ ...field }));

    this.documentPages.set(pages);
    this.fields.set(fields);
    this.activePage.set(this.clamp(
      Math.floor(schema.view?.activePage ?? 1),
      1,
      Math.max(1, pages.length),
    ));
    this.scheduleDomSync(() => this.syncTextFieldEditors());
  }

  private getSchemaPages(schema: PdfBuilderSchema): readonly PdfBuilderSchemaPage[] {
    if (schema.document.pages?.length) {
      return schema.document.pages.map(page => ({ ...page }));
    }

    const sourcePages = this.createSourcePages(schema.document.sourcePageCount ?? 0);
    const virtualPages = Array.from(
      { length: Math.max(0, schema.document.addedPageCount ?? 0) },
      (_, index) => this.createVirtualPage(sourcePages.length + index + 1),
    );
    const pages = [...sourcePages, ...virtualPages];

    return pages.length ? pages : [this.createVirtualPage(1)];
  }

  private createSourcePages(count: number): PdfBuilderSchemaPage[] {
    return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => {
      const page = index + 1;

      return {
        id: `source-${page}`,
        kind: 'source',
        label: page === 1 ? 'Cover' : `Page ${page}`,
        sourcePage: page,
        width: PDF_SIGNER_PAGE_WIDTH,
        height: PDF_SIGNER_PAGE_HEIGHT,
      };
    });
  }

  private createVirtualPage(page: number): PdfBuilderSchemaPage {
    return {
      id: `virtual-${page}`,
      kind: 'virtual',
      label: `Page ${page}`,
      width: PDF_SIGNER_PAGE_WIDTH,
      height: PDF_SIGNER_PAGE_HEIGHT,
    };
  }

  private groupPagesIntoSpreads(
    pages: readonly PdfSignerPage[],
    mode: PdfBuilderSchema['view']['spreadMode'],
  ): readonly PdfSignerPageSpread[] {
    if (mode === 'single') {
      return pages.map(page => ({
        id: `single-${page.page}`,
        leadingPlaceholder: false,
        pages: [page],
      }));
    }

    const spreads: PdfSignerPageSpread[] = [];
    let pageIndex = 0;

    if (mode === 'two-even' && pages.length) {
      spreads.push({
        id: 'two-even-cover',
        leadingPlaceholder: true,
        pages: [pages[0]],
      });
      pageIndex = 1;
    }

    while (pageIndex < pages.length) {
      const spreadPages = pages.slice(pageIndex, pageIndex + 2);

      spreads.push({
        id: `${mode}-${spreadPages.map(page => page.page).join('-')}`,
        leadingPlaceholder: false,
        pages: spreadPages,
      });
      pageIndex += 2;
    }

    return spreads;
  }

  private isOwnedByCurrentSigner(field: PdfBuilderField): boolean {
    const signer = this.signer();
    const fieldSigner = field.signer;

    if (!signer || !fieldSigner) {
      return false;
    }

    if (signer.id && fieldSigner.id === signer.id) {
      return true;
    }

    const signerEmail = signer.email?.trim().toLocaleLowerCase();
    const fieldSignerEmail = fieldSigner.email?.trim().toLocaleLowerCase();

    return !!signerEmail && signerEmail === fieldSignerEmail;
  }

  private updateFieldValue(fieldId: string, value: string): PdfBuilderField | null {
    const previousField = this.fields().find(field => field.id === fieldId);

    if (!previousField || !this.isFieldEditable(previousField) || previousField.value === value) {
      return null;
    }

    const field = { ...previousField, value };

    this.fields.update(fields => fields.map(item => item.id === fieldId ? field : item));
    this.emitFieldChange(previousField, field);

    return field;
  }

  private updateField(
    fieldId: string,
    update: (field: PdfBuilderField) => PdfBuilderField,
  ): PdfBuilderField | null {
    const previousField = this.fields().find(field => field.id === fieldId);

    if (!previousField || !this.isFieldEditable(previousField)) {
      return null;
    }

    const field = update(previousField);

    this.fields.update(fields => fields.map(item => item.id === fieldId ? field : item));
    this.emitFieldChange(previousField, field);

    return field;
  }

  private emitFieldChange(previousField: PdfBuilderField, field: PdfBuilderField): void {
    const source = this.schema();

    if (!source) {
      return;
    }

    const schema: PdfBuilderSchema = {
      ...source,
      view: {
        ...source.view,
        activePage: this.activePage(),
        selectedFieldId: null,
      },
      fields: this.fields().map(item => ({ ...item })),
    };

    this.lastEmittedSchema = schema;
    this.schemaChange.emit(schema);
    this.fieldValueChange.emit({
      field,
      previousValue: previousField.value,
      value: field.value,
      schema,
    });
  }

  private focusTextFieldEditor(fieldId: string): void {
    const field = this.fields().find(item => item.id === fieldId);

    if (!field || !this.isFieldEditable(field) || field.type !== 'text') {
      return;
    }

    this.scheduleDomSync(() => {
      const currentField = this.fields().find(item => item.id === fieldId);
      const editor = this.getTextFieldEditorElement(fieldId);

      if (!currentField || !editor) {
        return;
      }

      if ((editor.textContent ?? '') !== currentField.value) {
        editor.textContent = currentField.value;
      }

      editor.focus();
      this.placeContentEditableCaretAtEnd(editor);
    });
  }

  private syncTextFieldEditors(): void {
    const activeElement = this.document.activeElement;

    for (const field of this.fields()) {
      if (field.type !== 'text' || !this.isFieldEditable(field)) {
        continue;
      }

      const editor = this.getTextFieldEditorElement(field.id);

      if (!editor || editor === activeElement || (editor.textContent ?? '') === field.value) {
        continue;
      }

      editor.textContent = field.value;
    }
  }

  private openDateFieldPicker(field: PdfBuilderField): void {
    const picker = this.dateFieldPicker();
    const input = this.dateFieldInput();
    const anchor = this.getDatePickerAnchorElement();
    const fieldElement = this.getOverlayFieldElement(field.id);

    if (!picker || !input || !anchor || !fieldElement || !this.isFieldEditable(field)) {
      return;
    }

    const rect = fieldElement.getBoundingClientRect();

    this.setCssVar(anchor, '--pdf-signer-date-anchor-left', `${rect.left}px`);
    this.setCssVar(anchor, '--pdf-signer-date-anchor-top', `${rect.top}px`);
    this.setCssVar(anchor, '--pdf-signer-date-anchor-width', `${rect.width}px`);
    this.setCssVar(anchor, '--pdf-signer-date-anchor-height', `${rect.height}px`);
    input.registerOnChange((date: Date | null) => this.applyDateFieldValue(field.id, date));
    input.writeValue(this.parseDateFieldValue(field.value));
    this.scheduleDomSync(() => picker.open());
  }

  private applyDateFieldValue(fieldId: string, date: Date | null): void {
    if (!date || Number.isNaN(date.getTime())) {
      return;
    }

    const value = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

    this.updateFieldValue(fieldId, value);
  }

  private parseDateFieldValue(value: string): Date | null {
    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp) ? null : new Date(timestamp);
  }

  private openStampDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<
      PdfBuilderStampDialog,
      { stamps: readonly PdfBuilderStampAsset[] },
      PdfBuilderStampDialogResult
    >(PdfBuilderStampDialog, {
      width: '640px',
      showCloseButton: true,
      data: { stamps: this.stamps() },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      void this.applyStampDialogResult(field, result).catch(error => {
        console.error('Failed to apply stamp.', error);
      });
    });
  }

  private async applyStampDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderStampDialogResult,
  ): Promise<void> {
    const value = result.type === 'asset'
      ? result.stamp.dataUrl?.trim() || result.stamp.imageUrl?.trim() || ''
      : await this.readImageFileAsDataUrl(result.file);

    if (!value) {
      return;
    }

    const appliedField = this.updateField(field.id, current => ({ ...current, value }));

    if (!appliedField) {
      return;
    }

    if (result.type === 'asset') {
      this.stampSelected.emit({ field: appliedField, stamp: result.stamp });
    } else {
      this.stampUploaded.emit({ field: appliedField, file: result.file });
    }
  }

  private readImageFileAsDataUrl(file: File): Promise<string> {
    const FileReaderConstructor = this.document.defaultView?.FileReader;

    if (!FileReaderConstructor) {
      return Promise.reject(new Error('Image file reading is not available.'));
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReaderConstructor();

      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('The selected stamp image could not be read.'));
      });
      reader.addEventListener('error', () => {
        reject(reader.error ?? new Error('The selected stamp image could not be read.'));
      });
      reader.readAsDataURL(file);
    });
  }

  private openSignatureDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<
      PdfBuilderSignatureDialog,
      PdfBuilderSignatureDialogData,
      PdfBuilderSignatureDialogResult
    >(PdfBuilderSignatureDialog, {
      width: '720px',
      showCloseButton: true,
      data: { signatures: this.uploadedSignatures() },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        void this.applySignatureDialogResult(field, result);
      }
    });
  }

  private openInitialsDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<
      PdfBuilderSignatureDialog,
      PdfBuilderSignatureDialogData,
      PdfBuilderSignatureDialogResult
    >(PdfBuilderSignatureDialog, {
      width: '720px',
      showCloseButton: true,
      data: {
        signatures: this.uploadedInitials(),
        title: 'Initials',
        includeDraw: false,
        typePlaceholder: 'Type initials',
        uploadMainText: 'Drag & drop an initials image here',
        uploadDropText: 'Drop initials image here.',
        uploadInvalidText: 'Select an image file.',
        uploadAllowedTypesText: 'Image files are accepted.',
        savedTabLabel: 'My Initials',
        savedListLabel: 'Saved initials',
        acceptLabel: 'Accept initials',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        void this.applyInitialsDialogResult(field, result);
      }
    });
  }

  private async applySignatureDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<void> {
    const currentField = this.fields().find(item => item.id === field.id);

    if (!currentField || currentField.type !== 'signature' || !this.isFieldEditable(currentField)) {
      return;
    }

    const uploadResult = await this.resolveSignatureUploadResult(currentField, result);
    const label = this.getSignatureResultLabel(uploadResult, this.getDialogResultLabel(result));
    const value = this.getSignatureResultValue(uploadResult, this.getDialogResultValue(result));
    const appliedField = this.updateField(field.id, current => ({ ...current, label, value }));

    if (!appliedField) {
      return;
    }

    switch (result.type) {
      case 'asset':
        this.signatureSelected.emit({ field: appliedField, signature: result.signature });
        return;
      case 'draw':
        this.signatureDrawn.emit({ field: appliedField, dataUrl: result.dataUrl });
        return;
      case 'type':
        this.signatureTyped.emit({
          field: appliedField,
          value: result.value,
          dataUrl: result.dataUrl,
          fontFamily: result.fontFamily,
          color: result.color,
        });
        return;
      case 'file':
        this.signatureUploaded.emit({ field: appliedField, file: result.file });
    }
  }

  private async applyInitialsDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<void> {
    const currentField = this.fields().find(item => item.id === field.id);

    if (
      !currentField ||
      currentField.type !== 'initials' ||
      !this.isFieldEditable(currentField) ||
      result.type === 'draw'
    ) {
      return;
    }

    const uploadResult = await this.resolveInitialsUploadResult(currentField, result);
    const label = this.getSignatureResultLabel(uploadResult, this.getDialogResultLabel(result));
    const value = this.getSignatureResultValue(uploadResult, this.getDialogResultValue(result));
    const appliedField = this.updateField(field.id, current => ({ ...current, label, value }));

    if (!appliedField) {
      return;
    }

    switch (result.type) {
      case 'asset':
        this.initialsSelected.emit({ field: appliedField, initials: result.signature });
        return;
      case 'type':
        this.initialsTyped.emit({
          field: appliedField,
          value: result.value,
          dataUrl: result.dataUrl,
          fontFamily: result.fontFamily,
          color: result.color,
        });
        return;
      case 'file':
        this.initialsUploaded.emit({ field: appliedField, file: result.file });
        return;
    }
  }

  private async resolveSignatureUploadResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<PdfBuilderSignatureUploadCallbackResult | null> {
    if (result.type === 'draw') {
      const callback = this.drawnSignatureUploadCallback();

      return callback ? callback({ field, dataUrl: result.dataUrl }) : null;
    }

    if (result.type === 'file') {
      const callback = this.signatureImageUploadCallback();

      return callback ? callback({ field, file: result.file }) : null;
    }

    return null;
  }

  private async resolveInitialsUploadResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<PdfBuilderSignatureUploadCallbackResult | null> {
    if (result.type === 'file') {
      const callback = this.initialsImageUploadCallback();

      return callback ? callback({ field, file: result.file }) : null;
    }

    return null;
  }

  private getSignatureResultLabel(
    result: PdfBuilderSignatureUploadCallbackResult | null,
    fallback: string,
  ): string {
    if (!result || typeof result === 'string') {
      return fallback;
    }

    const customResult = result as { readonly label?: string };

    return customResult.label ?? result.name ?? fallback;
  }

  private getSignatureResultValue(
    result: PdfBuilderSignatureUploadCallbackResult | null,
    fallback: string,
  ): string {
    if (!result) {
      return fallback;
    }

    if (typeof result === 'string') {
      return result;
    }

    const customResult = result as { readonly value?: string };

    return result.dataUrl ?? result.imageUrl ?? customResult.value ?? fallback;
  }

  private getDialogResultLabel(result: PdfBuilderSignatureDialogResult): string {
    switch (result.type) {
      case 'asset':
        return result.signature.name;
      case 'draw':
        return 'Drawn signature';
      case 'type':
        return result.value;
      case 'file':
        return result.file.name;
    }
  }

  private getDialogResultValue(result: PdfBuilderSignatureDialogResult): string {
    switch (result.type) {
      case 'asset':
        return result.signature.dataUrl ?? result.signature.imageUrl ?? result.signature.name;
      case 'draw':
        return result.dataUrl;
      case 'type':
        return result.dataUrl;
      case 'file':
        return result.file.name;
    }
  }

  private syncPageGeometry(): void {
    const width = PDF_SIGNER_PAGE_WIDTH * this.pdfScale();
    const height = PDF_SIGNER_PAGE_HEIGHT * this.pdfScale();

    for (const element of this.getPageShellElements()) {
      this.setCssVar(element, '--pdf-signer-page-width', `${width}px`);
      this.setCssVar(element, '--pdf-signer-page-height', `${height}px`);
    }
  }

  private syncOverlayGeometry(): void {
    const fields = new Map(this.fields().map(field => [field.id, field]));

    for (const element of this.getOverlayFieldElements()) {
      const fieldId = element.getAttribute('data-field-id');
      const field = fieldId ? fields.get(fieldId) : null;

      if (!field) {
        continue;
      }

      const scale = this.getRenderedPageScale(field.page);

      this.setCssVar(element, '--pdf-signer-field-left', `${field.x * scale.x}px`);
      this.setCssVar(element, '--pdf-signer-field-top', `${field.y * scale.y}px`);
      this.setCssVar(element, '--pdf-signer-field-width', `${field.width * scale.x}px`);
      this.setCssVar(element, '--pdf-signer-field-height', `${field.height * scale.y}px`);

      if (field.type === 'text') {
        this.setCssVar(element, '--pdf-signer-text-font-size', `${this.getTextFieldFontSize(field)}px`);
        this.setCssVar(element, '--pdf-signer-text-font-family', this.getTextFieldFontFamily(field));
        this.setCssVar(element, '--pdf-signer-text-font-color', this.getTextFieldFontColor(field));
      }
    }
  }

  private getRenderedPageScale(pageNumber: number): { x: number; y: number } {
    const pageShell = this.getPageShellElement(pageNumber);
    const rect = this.getElementClientRect(pageShell);

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      const scale = this.pdfScale();
      return { x: scale, y: scale };
    }

    const isQuarterTurn = this.pageRotation() === 1 || this.pageRotation() === 3;

    return {
      x: (isQuarterTurn ? rect.height : rect.width) / PDF_SIGNER_PAGE_WIDTH,
      y: (isQuarterTurn ? rect.width : rect.height) / PDF_SIGNER_PAGE_HEIGHT,
    };
  }

  private getPageShellElement(pageNumber: number): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(
      `.pdf-page-shell[data-page-number="${pageNumber}"]`,
    );
  }

  private getPageShellElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.pdf-page-shell'));
  }

  private getOverlayFieldElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-field-id]'));
  }

  private getOverlayFieldElement(fieldId: string): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(`[data-field-id="${fieldId}"]`);
  }

  private scrollFieldIntoViewport(fieldElement: HTMLElement): void {
    const container = this.viewerScrollbar()?.scrollableContentRef().nativeElement;

    if (!container) {
      this.scrollElementIntoView(fieldElement);
      return;
    }

    const containerRect = this.getElementClientRect(container);
    const fieldRect = this.getElementClientRect(fieldElement);

    if (!containerRect || !fieldRect || typeof container.scrollTo !== 'function') {
      this.scrollElementIntoView(fieldElement);
      return;
    }

    const top = container.scrollTop
      + fieldRect.top
      - containerRect.top
      - (container.clientHeight - fieldRect.height) / 2;
    const left = container.scrollLeft
      + fieldRect.left
      - containerRect.left
      - (container.clientWidth - fieldRect.width) / 2;

    container.scrollTo({
      top: this.clamp(top, 0, Math.max(0, container.scrollHeight - container.clientHeight)),
      left: this.clamp(left, 0, Math.max(0, container.scrollWidth - container.clientWidth)),
      behavior: 'smooth',
    });
  }

  private scrollElementIntoView(element: HTMLElement): void {
    if (typeof element.scrollIntoView !== 'function') {
      return;
    }

    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    });
  }

  private getElementClientRect(element: Element | null): DOMRect | null {
    return element && typeof element.getBoundingClientRect === 'function'
      ? element.getBoundingClientRect()
      : null;
  }

  private getDatePickerAnchorElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.date-picker-anchor');
  }

  private getTextFieldEditorElement(fieldId: string): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(
      `[contenteditable][data-text-editor-for="${fieldId}"]`,
    );
  }

  private placeContentEditableCaretAtEnd(editor: HTMLElement): void {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    const range = this.document.createRange();

    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = defaultView.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private scheduleDomSync(callback: () => void): void {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      callback();
      return;
    }

    if (typeof defaultView.requestAnimationFrame === 'function') {
      defaultView.requestAnimationFrame(callback);
      return;
    }

    defaultView.setTimeout(callback, 0);
  }

  private setCssVar(element: HTMLElement, name: string, value: string): void {
    this.renderer.setStyle(element, name, value, RendererStyleFlags2.DashCase);
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
  }
}
