import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import {
  Datepicker,
  DatepickerInput,
  provideNativeDateAdapter,
} from '@ngstarter-ui/components/datepicker';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { FormField, IconButtonSuffix, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemLine,
  ListItemMeta,
  ListItemTitle,
} from '@ngstarter-ui/components/list';
import {
  Menu,
  MenuDivider,
  MenuHeading,
  MenuItem,
  MenuTrigger,
} from '@ngstarter-ui/components/menu';
import {
  Panel,
  PanelAside,
  PanelContent,
  PanelHeader,
  PanelSidebar,
} from '@ngstarter-ui/components/panel';
import { Popover, PopoverContent } from '@ngstarter-ui/components/popover';
import {
  PdfViewer,
  PdfViewerAnnotations,
  PdfViewerSearch,
  type PdfViewerAnnotationView,
  type PdfViewerLoadedEvent,
  type PdfViewerSearchOptions,
  type PdfViewerSearchResultView,
  type PdfViewerSource,
} from '@ngstarter-ui/components/pdf-viewer';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import {
  Toolbar,
  ToolbarItem,
  ToolbarSpacer,
} from '@ngstarter-ui/components/toolbar';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import {
  Tree,
  TreeNode,
  TreeNodeDef,
  TreeNodePadding,
} from '@ngstarter-ui/components/tree';
import {
  PdfBuilderSignatureDialog,
  type PdfBuilderSignatureDialogData,
  type PdfBuilderSignatureDialogResult,
} from '../signature-dialog/signature-dialog';
import {
  PdfBuilderStampDialog,
  type PdfBuilderStampDialogResult,
} from '../stamp-dialog/stamp-dialog';

export type PdfBuilderCanvasTool = 'select' | 'pan' | 'text';
export type PdfBuilderFieldType = 'text' | 'variable' | 'date' | 'signature' | 'initials' | 'checkbox' | 'stamp';
export type PdfBuilderFieldSlot = 'primary' | 'date' | 'signature' | 'initials' | 'checkbox' | 'comment' | 'footer' | 'side';
export type PdfBuilderSpreadMode = 'single' | 'two-odd' | 'two-even';
export type PdfBuilderScrollLayout = 'vertical' | 'horizontal';
export type PdfBuilderPageRotation = 0 | 1 | 2 | 3;
export type PdfBuilderSchemaPageKind = 'source' | 'virtual';

const PDF_BUILDER_PAGE_WIDTH = 595.276;
const PDF_BUILDER_PAGE_HEIGHT = 841.89;
const PDF_BUILDER_MAX_PORTRAIT_PAGE_WIDTH = 814;
const PDF_BUILDER_FIXED_PAGE_SCALE = PDF_BUILDER_MAX_PORTRAIT_PAGE_WIDTH / PDF_BUILDER_PAGE_WIDTH;

interface PdfBuilderTool {
  readonly type: PdfBuilderFieldType;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

interface PdfBuilderVariableBinding {
  readonly label: string;
  readonly path: string;
}

interface PdfBuilderLayerNode {
  id: string;
  label: string;
  icon: string;
  meta?: string;
  required?: boolean;
  children?: PdfBuilderLayerNode[];
}

interface PdfBuilderPage {
  readonly page: number;
  readonly label: string;
  readonly kind: PdfBuilderSchemaPageKind;
  readonly sourcePage: number | null;
}

interface PdfBuilderPageSpread {
  readonly id: string;
  readonly leadingPlaceholder: boolean;
  readonly pages: readonly PdfBuilderPage[];
}

export interface PdfBuilderField {
  readonly id: string;
  readonly type: PdfBuilderFieldType;
  readonly page: number;
  readonly label: string;
  readonly binding: string;
  readonly value: string;
  readonly signer?: PdfBuilderFieldSigner | null;
  readonly icon: string;
  readonly slot: PdfBuilderFieldSlot;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly required: boolean;
  readonly readonly: boolean;
  readonly locked: boolean;
}

export interface PdfBuilderRecipient {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly role?: string;
  readonly avatarLabel?: string;
  readonly isCurrentUser?: boolean;
  readonly fieldIds?: readonly string[];
  readonly disabled?: boolean;
}

export interface PdfBuilderSigner {
  readonly id: string;
  readonly fullName: string;
  readonly email?: string;
}

export interface PdfBuilderFieldSigner {
  readonly id: string;
  readonly fullName: string;
  readonly email?: string;
}

export interface PdfBuilderStampAsset {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly dataUrl?: string;
}

export interface PdfBuilderStampSelection {
  readonly field: PdfBuilderField;
  readonly stamp: PdfBuilderStampAsset;
}

export interface PdfBuilderStampUpload {
  readonly field: PdfBuilderField;
  readonly file: File;
}

export interface PdfBuilderSignatureAsset {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly dataUrl?: string;
}

export type PdfBuilderInitialsAsset = PdfBuilderSignatureAsset;

export interface PdfBuilderSignatureSelection {
  readonly field: PdfBuilderField;
  readonly signature: PdfBuilderSignatureAsset;
}

export interface PdfBuilderInitialsSelection {
  readonly field: PdfBuilderField;
  readonly initials: PdfBuilderInitialsAsset;
}

export interface PdfBuilderSignatureUpload {
  readonly field: PdfBuilderField;
  readonly file: File;
}

export interface PdfBuilderInitialsUpload {
  readonly field: PdfBuilderField;
  readonly file: File;
}

export interface PdfBuilderSignatureDraw {
  readonly field: PdfBuilderField;
  readonly dataUrl: string;
}

export interface PdfBuilderSignatureType {
  readonly field: PdfBuilderField;
  readonly value: string;
  readonly dataUrl: string;
  readonly fontFamily: string;
  readonly color: string;
}

export type PdfBuilderInitialsType = PdfBuilderSignatureType;

export type PdfBuilderSignatureUploadCallbackResult =
  | string
  | PdfBuilderSignatureAsset
  | {
    readonly label?: string;
    readonly name?: string;
    readonly value?: string;
    readonly imageUrl?: string;
    readonly dataUrl?: string;
  };

export interface PdfBuilderDrawnSignatureUploadContext {
  readonly field: PdfBuilderField;
  readonly dataUrl: string;
}

export interface PdfBuilderSignatureImageUploadContext {
  readonly field: PdfBuilderField;
  readonly file: File;
}

export interface PdfBuilderInitialsImageUploadContext {
  readonly field: PdfBuilderField;
  readonly file: File;
}

export type PdfBuilderDrawnSignatureUploadCallback = (
  context: PdfBuilderDrawnSignatureUploadContext,
) => PdfBuilderSignatureUploadCallbackResult | Promise<PdfBuilderSignatureUploadCallbackResult>;

export type PdfBuilderSignatureImageUploadCallback = (
  context: PdfBuilderSignatureImageUploadContext,
) => PdfBuilderSignatureUploadCallbackResult | Promise<PdfBuilderSignatureUploadCallbackResult>;

export type PdfBuilderInitialsImageUploadCallback = (
  context: PdfBuilderInitialsImageUploadContext,
) => PdfBuilderSignatureUploadCallbackResult | Promise<PdfBuilderSignatureUploadCallbackResult>;

export interface PdfBuilderSchemaPage {
  readonly id: string;
  readonly kind: PdfBuilderSchemaPageKind;
  readonly label?: string;
  readonly sourcePage?: number;
  readonly width?: number;
  readonly height?: number;
}

export interface PdfBuilderSchema {
  readonly version: 1;
  readonly document: {
    readonly name: string;
    readonly source: PdfViewerSource | null;
    readonly sizeLabel: string;
    readonly sourcePageCount: number;
    readonly addedPageCount: number;
    readonly pages?: readonly PdfBuilderSchemaPage[];
  };
  readonly view: {
    readonly activePage: number;
    readonly selectedFieldId: string | null;
    readonly activeCanvasTool: PdfBuilderCanvasTool;
    readonly pageStripVisible: boolean;
    readonly libraryCollapsed: boolean;
    readonly searchPanelVisible: boolean;
    readonly annotationsPanelVisible: boolean;
    readonly spreadMode: PdfBuilderSpreadMode;
    readonly scrollLayout: PdfBuilderScrollLayout;
    readonly pageRotation: PdfBuilderPageRotation;
    readonly activeSearchQuery: string;
    readonly expandedLayerNodeIds: readonly string[];
  };
  readonly fields: readonly PdfBuilderField[];
}

interface PdfBuilderActivity {
  readonly title: string;
  readonly detail: string;
  readonly icon: string;
}

interface PdfBuilderHistoryState {
  readonly fields: readonly PdfBuilderField[];
  readonly selectedFieldId: string | null;
  readonly activePage: number;
}

type PdfBuilderAutosizeKey = 'label' | 'value';

interface PdfBuilderPlacementGhost {
  readonly type: PdfBuilderFieldType;
  readonly label: string;
  readonly icon: string;
  readonly clientX: number;
  readonly clientY: number;
  readonly width: number;
  readonly height: number;
  readonly overPage: boolean;
  readonly page: number | null;
  readonly pageX: number | null;
  readonly pageY: number | null;
}

interface PdfBuilderFieldDrag {
  readonly fieldId: string;
  readonly page: number;
  readonly pointerId: number;
  readonly originClientX: number;
  readonly originClientY: number;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
  readonly moved: boolean;
  readonly initialFields: readonly PdfBuilderField[];
  readonly initialSelectedFieldId: string | null;
  readonly initialActivePage: number;
}

interface PdfBuilderFieldResize {
  readonly fieldId: string;
  readonly page: number;
  readonly pointerId: number;
  readonly originClientX: number;
  readonly originClientY: number;
  readonly startWidth: number;
  readonly startHeight: number;
  readonly startX: number;
  readonly startY: number;
  readonly moved: boolean;
  readonly initialFields: readonly PdfBuilderField[];
  readonly initialSelectedFieldId: string | null;
  readonly initialActivePage: number;
}

@Component({
  selector: 'ngs-pdf-builder',
  exportAs: 'ngsPdfBuilder',
  imports: [
    Avatar,
    Button,
    Datepicker,
    DatepickerInput,
    FormField,
    IconButtonSuffix,
    IconPrefix,
    Icon,
    Input,
    List,
    ListItem,
    ListItemAvatar,
    ListItemLine,
    ListItemMeta,
    ListItemTitle,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuItem,
    MenuTrigger,
    Panel,
    PanelAside,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    Popover,
    PopoverContent,
    PdfViewer,
    PdfViewerAnnotations,
    PdfViewerSearch,
    ScrollbarArea,
    Tab,
    TabGroup,
    Toolbar,
    ToolbarItem,
    ToolbarSpacer,
    Tooltip,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './pdf-builder.html',
  styleUrl: './pdf-builder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-builder not-prose',
  },
})
export class PdfBuilder {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private fieldId = 0;
  private removePlacementListeners: (() => void) | null = null;
  private removeFieldDragListeners: (() => void) | null = null;
  private removeFieldResizeListeners: (() => void) | null = null;
  private layerExpansionRestoreScheduled = false;
  private suppressFieldClickId: string | null = null;
  private dragCursorLocked = false;
  private schemaChangeEffectReady = false;
  private suppressNextSchemaChange = false;
  private readonly dragCursorClass = 'ngs-pdf-builder-drag-cursor';

  readonly schema = input<PdfBuilderSchema | null>(null);
  readonly annotations = input<readonly PdfViewerAnnotationView[]>([]);
  readonly recipients = input<readonly PdfBuilderRecipient[]>([]);
  readonly signers = input<readonly PdfBuilderSigner[]>([]);
  readonly stamps = input<readonly PdfBuilderStampAsset[]>([]);
  readonly uploadedSignatures = input<readonly PdfBuilderSignatureAsset[]>([]);
  readonly uploadedInitials = input<readonly PdfBuilderInitialsAsset[]>([]);
  readonly drawnSignatureUploadCallback = input<PdfBuilderDrawnSignatureUploadCallback | null | undefined>(undefined);
  readonly signatureImageUploadCallback = input<PdfBuilderSignatureImageUploadCallback | null | undefined>(undefined);
  readonly initialsImageUploadCallback = input<PdfBuilderInitialsImageUploadCallback | null | undefined>(undefined);
  readonly schemaChange = output<PdfBuilderSchema>();
  readonly createBlankPdf = output<void>();
  readonly exportPdf = output<void>();
  readonly recipientSelected = output<PdfBuilderRecipient>();
  readonly addRecipient = output<void>();
  readonly recipientSearchChanged = output<string>();
  readonly createRecipientContact = output<string>();
  readonly editRecipientDetails = output<PdfBuilderRecipient>();
  readonly replaceRecipient = output<PdfBuilderRecipient>();
  readonly removeRecipient = output<PdfBuilderRecipient>();
  readonly stampSelected = output<PdfBuilderStampSelection>();
  readonly stampUploaded = output<PdfBuilderStampUpload>();
  readonly signatureSelected = output<PdfBuilderSignatureSelection>();
  readonly signatureUploaded = output<PdfBuilderSignatureUpload>();
  readonly signatureDrawn = output<PdfBuilderSignatureDraw>();
  readonly signatureTyped = output<PdfBuilderSignatureType>();
  readonly initialsSelected = output<PdfBuilderInitialsSelection>();
  readonly initialsUploaded = output<PdfBuilderInitialsUpload>();
  readonly initialsTyped = output<PdfBuilderInitialsType>();

  protected readonly layersTree = viewChild<Tree<PdfBuilderLayerNode>>('layersTree');
  protected readonly dateFieldPicker = viewChild<Datepicker<Date>>('dateFieldPicker');
  protected readonly dateFieldInput = viewChild<DatepickerInput<Date>>('dateFieldInput');
  protected readonly documentName = signal('Untitled.pdf');
  protected readonly documentSource = signal<PdfViewerSource>(null);
  protected readonly documentSizeLabel = signal('Virtual PDF');
  protected readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';
  protected readonly sourcePageCount = signal(0);
  protected readonly addedPageCount = signal(1);
  protected readonly documentPages = signal<readonly PdfBuilderSchemaPage[]>([
    this.createVirtualSchemaPage(1),
  ]);
  protected readonly pageCount = computed(() => this.documentPages().length);
  protected readonly activePage = signal(1);
  protected readonly pdfScale = signal(PDF_BUILDER_FIXED_PAGE_SCALE);
  protected readonly textFieldPlaceholder = 'Enter value';
  protected readonly activeCanvasTool = signal<PdfBuilderCanvasTool>('select');
  protected readonly selectedFieldId = signal<string | null>(null);
  protected readonly hoveredFieldId = signal<string | null>(null);
  protected readonly editingFieldId = signal<string | null>(null);
  protected readonly placementGhost = signal<PdfBuilderPlacementGhost | null>(null);
  protected readonly fieldDrag = signal<PdfBuilderFieldDrag | null>(null);
  protected readonly fieldResize = signal<PdfBuilderFieldResize | null>(null);
  protected readonly pageStripVisible = signal(true);
  protected readonly libraryCollapsed = signal(false);
  protected readonly fieldSettingsPanelVisible = signal(false);
  protected readonly recipientSearchQuery = signal('');
  protected readonly searchPanelVisible = signal(false);
  protected readonly annotationsPanelVisible = signal(false);
  protected readonly spreadMode = signal<PdfBuilderSpreadMode>('single');
  protected readonly scrollLayout = signal<PdfBuilderScrollLayout>('vertical');
  protected readonly pageRotation = signal<PdfBuilderPageRotation>(0);
  protected readonly activeSearchQuery = signal('');
  protected readonly pdfSearchResults = signal<PdfViewerSearchResultView[]>([]);
  protected readonly expandedLayerNodeIds = signal<ReadonlySet<string>>(new Set(['page-1']));
  protected readonly undoStack = signal<readonly PdfBuilderHistoryState[]>([]);
  protected readonly redoStack = signal<readonly PdfBuilderHistoryState[]>([]);

  protected readonly tools = signal<readonly PdfBuilderTool[]>([
    {
      type: 'text',
      label: 'Text box',
      icon: 'fluent:text-font-24-regular',
      description: 'Place editable text anywhere on the page.',
    },
    {
      type: 'variable',
      label: 'Variable field',
      icon: 'fluent:braces-variable-24-regular',
      description: 'Bind text to contract or CRM data.',
    },
    {
      type: 'date',
      label: 'Date field',
      icon: 'fluent:calendar-ltr-24-regular',
      description: 'Pick a date and place it in the PDF.',
    },
    {
      type: 'signature',
      label: 'Signature field',
      icon: 'fluent:signature-24-regular',
      description: 'Add signer boxes to a document.',
    },
    {
      type: 'initials',
      label: 'Initials',
      icon: 'fluent:text-font-24-regular',
      description: 'Add initials boxes for signers.',
    },
    {
      type: 'checkbox',
      label: 'Checkbox',
      icon: 'fluent:checkbox-checked-24-regular',
      description: 'Add form choices to existing PDFs.',
    },
    {
      type: 'stamp',
      label: 'Stamp',
      icon: 'fluent:stamp-32-light',
      description: 'Approval, reviewed, or internal stamps.',
    },
  ]);

  protected readonly variableBindings = signal<readonly PdfBuilderVariableBinding[]>([
    { label: 'Company name', path: 'company.name' },
    { label: 'Counterparty name', path: 'counterparty.name' },
    { label: 'Effective date', path: 'contract.effective_date' },
    { label: 'Contract value', path: 'contract.value' },
    { label: 'Legal status', path: 'review.legal.status' },
  ]);

  protected readonly fields = signal<readonly PdfBuilderField[]>([]);

  protected readonly pages = computed<readonly PdfBuilderPage[]>(() =>
    Array.from({ length: this.pageCount() }, (_, index) => {
      const page = index + 1;

      const schemaPage = this.documentPages()[index];

      return {
        page,
        label: schemaPage?.label ?? (page === 1 ? 'Cover' : page === this.pageCount() ? 'Signatures' : `Page ${page}`),
        kind: schemaPage?.kind ?? 'virtual',
        sourcePage: schemaPage?.kind === 'source' ? schemaPage.sourcePage ?? page : null,
      };
    }),
  );
  protected readonly pageSpreads = computed<readonly PdfBuilderPageSpread[]>(() =>
    this.groupPagesIntoSpreads(this.pages(), this.spreadMode()),
  );

  protected readonly fieldCount = computed(() => this.fields().length);
  protected readonly canUndo = computed(() => this.undoStack().length > 0);
  protected readonly canRedo = computed(() => this.redoStack().length > 0);
  protected readonly canGoPrevious = computed(() => this.activePage() > 1);
  protected readonly canGoNext = computed(() => this.activePage() < this.pageCount());
  protected readonly selectedField = computed(() =>
    this.fields().find(field => field.id === this.selectedFieldId()) ?? null,
  );
  protected readonly recipientItems = computed(() => this.recipients().filter(recipient => recipient.id && recipient.name));
  protected readonly signerItems = computed(() => this.getNormalizedSigners());
  protected readonly isSearchPanelVisible = computed(() => this.searchPanelVisible());
  protected readonly isAnnotationsPanelVisible = computed(() =>
    !this.searchPanelVisible() && this.annotationsPanelVisible(),
  );
  protected readonly annotationItems = computed<PdfViewerAnnotationView[]>(() => [...this.annotations()]);

  protected readonly layerTree = computed<PdfBuilderLayerNode[]>(() =>
    Array.from({ length: this.pageCount() }, (_, index) => {
      const page = index + 1;
      const pageFields = this.fields().filter(field => field.page === page);

      return {
        id: `page-${page}`,
        label: `Page ${page}`,
        icon: 'fluent:document-one-page-24-regular',
        children: pageFields.map(field => ({
          id: field.id,
          label: field.label,
          icon: field.icon,
          meta: this.getLayerMeta(field),
          required: field.required,
        })),
      };
    }),
  );

  protected readonly activity = signal<readonly PdfBuilderActivity[]>([
    {
      title: 'Virtual PDF ready',
      detail: 'A one-page virtual PDF is ready for fields.',
      icon: 'fluent:document-one-page-24-regular',
    },
  ]);

  protected readonly layerChildrenAccessor = (node: PdfBuilderLayerNode) => node.children ?? [];
  protected readonly layerTrackBy = (_index: number, node: PdfBuilderLayerNode) => node.id;
  protected readonly hasLayerChildren = (_index: number, node: PdfBuilderLayerNode) =>
    !!node.children;

  private readonly handlePlacementPointerMove = (event: PointerEvent): void => {
    this.movePlacementGhost(event);
  };

  private readonly handlePlacementPointerUp = (event: PointerEvent): void => {
    this.finishPlacement(event);
  };

  private readonly handlePlacementPointerCancel = (): void => {
    this.cancelPlacement();
  };

  private readonly handleFieldDragPointerMove = (event: PointerEvent): void => {
    this.moveDraggedField(event);
  };

  private readonly handleFieldDragPointerUp = (event: PointerEvent): void => {
    this.finishFieldDrag(event);
  };

  private readonly handleFieldDragPointerCancel = (): void => {
    this.cancelFieldDrag();
  };

  private readonly handleFieldResizePointerMove = (event: PointerEvent): void => {
    this.resizeField(event);
  };

  private readonly handleFieldResizePointerUp = (event: PointerEvent): void => {
    this.finishFieldResize(event);
  };

  private readonly handleFieldResizePointerCancel = (): void => {
    this.cancelFieldResize();
  };

  constructor() {
    afterNextRender(() => this.restoreLayerTreeExpansion());
    this.destroyRef.onDestroy(() => {
      this.removePlacementEventListeners();
      this.removeFieldDragEventListeners();
      this.removeFieldResizeEventListeners();
      this.setDragCursorLocked(false);
    });

    effect(() => {
      const schema = this.schema();

      if (!schema) {
        return;
      }

      untracked(() => this.restoreSchema(schema));
    });

    effect(() => {
      this.pdfScale();
      this.activePage();
      this.pageCount();

      this.schedulePageGeometrySync();
    });

    effect(() => {
      this.fields();
      this.selectedField();
      this.pdfScale();
      this.fieldDrag();
      this.fieldResize();

      this.scheduleOverlayGeometrySync();
    });

    effect(() => {
      this.layerTree();
      this.expandedLayerNodeIds();

      this.scheduleLayerTreeExpansionRestore();
    });

    effect(() => {
      this.placementGhost();
      this.pdfScale();

      this.schedulePlacementGhostGeometrySync();
    });

    effect(() => {
      this.setDragCursorLocked(!!this.placementGhost() || !!this.fieldDrag());
    });

    effect(() => {
      const schema = this.captureSchema();

      if (!this.schemaChangeEffectReady) {
        this.schemaChangeEffectReady = true;
        return;
      }

      if (this.suppressNextSchemaChange) {
        this.suppressNextSchemaChange = false;
        return;
      }

      this.schemaChange.emit(schema);
    });
  }

  protected toggleLayerNode(
    tree: Tree<PdfBuilderLayerNode>,
    node: PdfBuilderLayerNode,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (!node.children?.length) {
      return;
    }

    if (tree.isExpanded(node)) {
      tree.collapse(node);
      this.expandedLayerNodeIds.update(ids => {
        const next = new Set(ids);
        next.delete(node.id);
        return next;
      });
      return;
    }

    tree.expand(node);
    this.expandedLayerNodeIds.update(ids => new Set(ids).add(node.id));
  }

  protected isLayerNodeExpanded(tree: Tree<PdfBuilderLayerNode>, node: PdfBuilderLayerNode): boolean {
    return tree.isExpanded(node) || this.expandedLayerNodeIds().has(node.id);
  }

  protected onLibraryTabChange(index: number): void {
    if (index === 1) {
      setTimeout(() => this.restoreLayerTreeExpansion());
    }
  }

  protected onPdfLoaded(event: PdfViewerLoadedEvent): void {
    const sourcePageCount = Math.max(0, event.pageCount);
    const virtualPages = this.documentPages().filter(page => page.kind === 'virtual');
    const pages = [
      ...this.createSourceSchemaPages(sourcePageCount),
      ...virtualPages,
    ];
    const pageCount = pages.length;

    this.setDocumentPages(pages);
    this.activePage.update(page => Math.max(1, Math.min(page, Math.max(1, pageCount))));
    this.fields.update(fields => fields.filter(field => field.page <= pageCount));
    this.expandedLayerNodeIds.update(ids => {
      const next = new Set(ids);

      for (let page = 1; page <= pageCount; page++) {
        next.add(`page-${page}`);
      }

      return next;
    });
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  protected selectPage(pageNumber: number): void {
    const nextPage = Math.max(1, Math.min(pageNumber, Math.max(1, this.pageCount())));

    this.activePage.set(nextPage);
    this.scrollPageIntoView(nextPage);
  }

  protected pageFields(pageNumber: number): readonly PdfBuilderField[] {
    return this.fields().filter(field => field.page === pageNumber);
  }

  private groupPagesIntoSpreads(
    pages: readonly PdfBuilderPage[],
    mode: PdfBuilderSpreadMode,
  ): readonly PdfBuilderPageSpread[] {
    if (mode === 'single') {
      return pages.map(page => ({
        id: `single-${page.page}`,
        leadingPlaceholder: false,
        pages: [page],
      }));
    }

    const spreads: PdfBuilderPageSpread[] = [];
    let pageIndex = 0;

    if (mode === 'two-even' && pages.length > 0) {
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

  protected isSourcePdfPage(pageNumber: number): boolean {
    return !!this.documentSource() && this.getSchemaPage(pageNumber)?.kind === 'source';
  }

  protected getSourcePageNumber(pageNumber: number): number {
    return this.getSchemaPage(pageNumber)?.sourcePage ?? pageNumber;
  }

  protected onViewerScroll(): void {
    const scrollElement = this.getViewerScrollElement();
    const pageShells = this.getPageShellElements();

    if (!scrollElement || !pageShells.length) {
      return;
    }

    const scrollRect = this.getElementClientRect(scrollElement);

    if (!scrollRect) {
      return;
    }

    const anchorTop = scrollRect.top + Math.min(160, scrollRect.height * 0.28);
    let nearestPage = this.activePage();
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const pageShell of pageShells) {
      const page = this.getPageNumberFromShell(pageShell);

      if (!page) {
        continue;
      }

      const rect = this.getElementClientRect(pageShell);

      if (!rect) {
        continue;
      }

      const distance = Math.abs(rect.top - anchorTop);

      if (rect.bottom >= scrollRect.top && rect.top <= scrollRect.bottom && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPage = page;
      }
    }

    if (nearestPage !== this.activePage()) {
      this.activePage.set(nearestPage);
    }
  }

  protected selectLayerNode(node: PdfBuilderLayerNode, event?: Event): void {
    event?.stopPropagation();

    const pageMatch = /^page-(\d+)$/.exec(node.id);

    if (pageMatch) {
      this.selectPage(Number(pageMatch[1]));
      return;
    }

    const field = this.fields().find(item => item.id === node.id);

    if (field) {
      this.expandedLayerNodeIds.update(ids => new Set(ids).add(`page-${field.page}`));
      this.activePage.set(field.page);
      this.selectedFieldId.set(field.id);
      this.editingFieldId.set(null);
      this.scrollFieldIntoView(field.id);
      setTimeout(() => this.restoreLayerTreeExpansion());
    }
  }

  protected selectField(fieldId: string, event?: Event): void {
    event?.stopPropagation();

    if (this.suppressFieldClickId === fieldId) {
      this.suppressFieldClickId = null;
      return;
    }

    const field = this.fields().find(item => item.id === fieldId);
    const wasSelected = this.selectedFieldId() === fieldId;

    this.selectedFieldId.set(fieldId);
    this.activeCanvasTool.set('select');

    if (field?.type === 'stamp' && wasSelected && !field.locked) {
      this.openStampDialog(field);
      return;
    }

    if (field?.type === 'signature' && wasSelected && !field.locked) {
      this.openSignatureDialog(field);
      return;
    }

    if (field?.type === 'initials' && wasSelected && !field.locked) {
      this.openInitialsDialog(field);
      return;
    }

    if (field?.type === 'text' && !field.locked) {
      this.startTextEditing(field.id);
      return;
    }

    this.editingFieldId.set(null);

    if (field?.type === 'date' && !field.locked) {
      this.openDateFieldPicker(field);
    }
  }

  protected openStampDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<PdfBuilderStampDialog, { stamps: readonly PdfBuilderStampAsset[] }, PdfBuilderStampDialogResult>(
      PdfBuilderStampDialog,
      {
        width: '640px',
        showCloseButton: true,
        data: {
          stamps: this.stamps(),
        },
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      void this.applyStampDialogResult(field, result).catch(error => {
        console.error('Failed to apply stamp.', error);
      });
    });
  }

  protected openSignatureDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<PdfBuilderSignatureDialog, PdfBuilderSignatureDialogData, PdfBuilderSignatureDialogResult>(
      PdfBuilderSignatureDialog,
      {
        width: '720px',
        showCloseButton: true,
        data: {
          signatures: this.uploadedSignatures(),
        },
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      void this.applySignatureDialogResult(field, result).catch(error => {
        console.error('Failed to apply signature.', error);
      });
    });
  }

  protected openInitialsDialog(field: PdfBuilderField): void {
    const dialogRef = this.dialog.open<PdfBuilderSignatureDialog, PdfBuilderSignatureDialogData, PdfBuilderSignatureDialogResult>(
      PdfBuilderSignatureDialog,
      {
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
      },
    );

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      void this.applyInitialsDialogResult(field, result).catch(error => {
        console.error('Failed to apply initials.', error);
      });
    });
  }

  protected beginFieldDrag(event: PointerEvent, fieldId: string): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const field = this.fields().find(item => item.id === fieldId);

    if (!field || field.locked) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const initialFields = this.fields().map(item => ({ ...item }));
    const initialSelectedFieldId = this.selectedFieldId();
    const initialActivePage = this.activePage();

    this.removeFieldDragEventListeners();
    this.editingFieldId.set(null);
    this.activeCanvasTool.set('select');
    this.activePage.set(field.page);
    this.fieldDrag.set({
      fieldId,
      page: field.page,
      pointerId: event.pointerId,
      originClientX: event.clientX,
      originClientY: event.clientY,
      startX: field.x,
      startY: field.y,
      width: field.width,
      height: field.height,
      moved: false,
      initialFields,
      initialSelectedFieldId,
      initialActivePage,
    });
    this.addFieldDragEventListeners();
  }

  protected canResizeField(field: PdfBuilderField): boolean {
    return field.type === 'text' ||
      field.type === 'variable' ||
      field.type === 'date' ||
      field.type === 'checkbox' ||
      field.type === 'stamp' ||
      field.type === 'signature' ||
      field.type === 'initials';
  }

  protected beginFieldResize(event: PointerEvent, fieldId: string): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const field = this.fields().find(item => item.id === fieldId);

    if (!field || field.locked || !this.canResizeField(field)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const initialFields = this.fields().map(item => ({ ...item }));
    const initialSelectedFieldId = this.selectedFieldId();
    const initialActivePage = this.activePage();

    this.removeFieldResizeEventListeners();
    this.removeFieldDragEventListeners();
    this.editingFieldId.set(null);
    this.activeCanvasTool.set('select');
    this.activePage.set(field.page);
    this.fieldResize.set({
      fieldId,
      page: field.page,
      pointerId: event.pointerId,
      originClientX: event.clientX,
      originClientY: event.clientY,
      startWidth: field.width,
      startHeight: field.height,
      startX: field.x,
      startY: field.y,
      moved: false,
      initialFields,
      initialSelectedFieldId,
      initialActivePage,
    });
    this.addFieldResizeEventListeners();
  }

  protected clearSelection(): void {
    if (this.activeCanvasTool() === 'text') {
      this.addField('text');
      return;
    }

    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.fieldSettingsPanelVisible.set(false);
  }

  protected updateTextFieldValue(fieldId: string, value: string): void {
    this.fields.update(fields =>
      fields.map(field => {
        if (field.id !== fieldId || field.type !== 'text' || field.locked) {
          return field;
        }

        return this.withAutosizedTextMetrics({ ...field, value });
      }),
    );
  }

  protected updateTextFieldValueFromEditor(fieldId: string, editor: HTMLElement): void {
    const value = editor.textContent ?? '';

    this.fields.update(fields =>
      fields.map(field => {
        if (field.id !== fieldId || field.type !== 'text' || field.locked) {
          return field;
        }

        return this.withContentEditableTextMetrics({ ...field, value }, editor);
      }),
    );
  }

  protected finishTextEditing(fieldId: string): void {
    if (this.editingFieldId() === fieldId) {
      this.editingFieldId.set(null);
    }
  }

  protected isFieldFilled(field: PdfBuilderField): boolean {
    if (field.type === 'variable') {
      return false;
    }

    return field.value.trim().length > 0 && field.value !== this.getDefaultValue(field.type);
  }

  protected getFieldDisplayValue(field: PdfBuilderField): string {
    if (field.type === 'text' && !field.value.trim()) {
      return this.textFieldPlaceholder;
    }

    if (field.type === 'variable') {
      return field.value.trim() || this.getVariableToken(field.binding);
    }

    if (field.type === 'date') {
      return field.value.trim() || 'Select date';
    }

    return field.value;
  }

  protected getFieldSignerTooltip(field: PdfBuilderField): string {
    if (field.id === this.selectedFieldId()) {
      return '';
    }

    return field.signer?.fullName.trim() ?? '';
  }

  protected getFieldSignerLabel(field: PdfBuilderField): string {
    return field.signer?.fullName.trim() || 'Assign recipient';
  }

  protected isSignatureImageValue(value: string): boolean {
    const source = value.trim();

    return /^data:image\//i.test(source) ||
      /^blob:/i.test(source) ||
      /^https?:\/\//i.test(source) ||
      source.startsWith('/') ||
      source.startsWith('assets/');
  }

  protected getVariableBindingLabel(field: PdfBuilderField | null): string {
    if (!field || field.type !== 'variable') {
      return 'Select binding';
    }

    const binding = this.variableBindings().find(item => item.path === field.binding);

    return binding?.label ?? (field.binding || 'Select binding');
  }

  protected applyVariableBinding(binding: PdfBuilderVariableBinding): void {
    const field = this.selectedField();

    if (!field || field.type !== 'variable' || field.locked) {
      return;
    }

    this.commitFields(fields =>
      fields.map(item =>
        item.id === field.id
          ? {
            ...item,
            binding: binding.path,
            value: this.getVariableToken(binding.path),
          }
          : item,
      ),
    );
    this.recordActivity('Binding updated', `${field.label} bound to ${binding.path}.`, 'fluent:database-link-24-regular');
  }

  private openDateFieldPicker(field: PdfBuilderField): void {
    const picker = this.dateFieldPicker();
    const input = this.dateFieldInput();
    const anchor = this.getDatePickerAnchorElement();
    const fieldElement = this.getOverlayFieldElement(field.id);

    if (!picker || !input || !anchor || !fieldElement) {
      return;
    }

    const rect = this.getElementClientRect(fieldElement);

    if (!rect) {
      return;
    }

    this.setCssVar(anchor, '--pdf-builder-date-anchor-left', `${rect.left}px`);
    this.setCssVar(anchor, '--pdf-builder-date-anchor-top', `${rect.top}px`);
    this.setCssVar(anchor, '--pdf-builder-date-anchor-width', `${rect.width}px`);
    this.setCssVar(anchor, '--pdf-builder-date-anchor-height', `${rect.height}px`);

    input.registerOnChange((date: Date | null) => this.applyDateFieldValue(field.id, date));
    input.writeValue(this.parseDateFieldValue(field.value));
    this.scheduleDomSync(() => picker.open());
  }

  private applyDateFieldValue(fieldId: string, date: Date | null): void {
    if (!date || Number.isNaN(date.getTime())) {
      return;
    }

    const value = this.formatDateFieldValue(date);

    this.commitFields(fields =>
      fields.map(field =>
        field.id === fieldId && field.type === 'date' && !field.locked
          ? { ...field, value }
          : field,
      ),
    );
    this.selectedFieldId.set(fieldId);
    this.recordActivity('Date selected', `${value} inserted.`, 'fluent:calendar-ltr-24-regular');
  }

  private parseDateFieldValue(value: string): Date | null {
    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp) ? null : new Date(timestamp);
  }

  private formatDateFieldValue(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private startTextEditing(fieldId: string): void {
    this.editingFieldId.set(fieldId);
    this.scheduleDomSync(() => {
      const editor = this.getTextFieldEditorElement(fieldId);
      const field = this.fields().find(item => item.id === fieldId);

      if (!editor || !field) {
        return;
      }

      if ((editor.textContent ?? '') !== field.value) {
        editor.textContent = field.value;
      }

      editor.focus();
      this.placeContentEditableCaretAtEnd(editor);
      this.document.defaultView?.setTimeout(() => {
        if (this.editingFieldId() === fieldId) {
          this.placeContentEditableCaretAtEnd(editor);
        }
      }, 0);
    });
  }

  protected addField(type: PdfBuilderFieldType): void {
    this.ensureDocumentPages();

    const field = this.createField(type, { slot: this.getDefaultSlotForType(type) });

    this.commitFields(fields => [...fields, field]);
    this.selectedFieldId.set(field.id);
    this.recordActivity('Field added', `${field.label} placed on Page ${field.page}.`, field.icon);
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  protected beginToolPlacement(event: PointerEvent, type: PdfBuilderFieldType): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.ensureDocumentPages();

    const metrics = this.getDefaultMetricsForType(type);
    const tool = this.tools().find(item => item.type === type);
    const pagePoint = this.getPdfPointFromClient(event.clientX, event.clientY);
    const pageMetrics = pagePoint ? this.getPlacementFieldMetrics(type, pagePoint.x, pagePoint.y) : null;

    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.activeCanvasTool.set('select');
    this.placementGhost.set({
      type,
      label: this.getDefaultLabel(type, tool?.label),
      icon: tool?.icon ?? 'fluent:form-24-regular',
      clientX: event.clientX,
      clientY: event.clientY,
      width: metrics.width,
      height: metrics.height,
      overPage: !!pagePoint,
      page: pagePoint?.page ?? null,
      pageX: pageMetrics?.x ?? null,
      pageY: pageMetrics?.y ?? null,
    });
    this.addPlacementEventListeners();
  }

  protected previousPage(): void {
    this.selectPage(this.activePage() - 1);
  }

  protected nextPage(): void {
    this.selectPage(this.activePage() + 1);
  }

  protected togglePageStrip(): void {
    this.pageStripVisible.update(visible => !visible);
  }

  protected toggleLibraryCollapsed(): void {
    this.libraryCollapsed.update(collapsed => !collapsed);
  }

  protected setSpreadMode(mode: PdfBuilderSpreadMode): void {
    this.spreadMode.set(mode);
    this.refreshViewerLayout();
  }

  protected setScrollLayout(layout: PdfBuilderScrollLayout): void {
    this.scrollLayout.set(layout);
    this.refreshViewerLayout();
  }

  protected rotateClockwise(): void {
    this.pageRotation.update(rotation => this.normalizePageRotation(rotation + 1));
    this.refreshViewerLayout();
  }

  protected rotateCounterClockwise(): void {
    this.pageRotation.update(rotation => this.normalizePageRotation(rotation - 1));
    this.refreshViewerLayout();
  }

  protected toggleFullscreen(): void {
    const targetDocument = this.document;
    const targetElement = this.elementRef.nativeElement;

    if (!targetDocument.defaultView) {
      return;
    }

    if (targetDocument.fullscreenElement) {
      void targetDocument.exitFullscreen?.();
      return;
    }

    void targetElement.requestFullscreen?.();
  }

  protected toggleSearchPanel(): void {
    const nextVisible = !this.searchPanelVisible();

    this.searchPanelVisible.set(nextVisible);

    if (nextVisible) {
      this.annotationsPanelVisible.set(false);
      this.updatePdfSearch({
        query: this.activeSearchQuery(),
        options: {
          caseSensitive: false,
          wholeWord: false,
        },
      });
    }
  }

  protected toggleAnnotationsPanel(): void {
    const nextVisible = !this.annotationsPanelVisible();

    this.annotationsPanelVisible.set(nextVisible);

    if (nextVisible) {
      this.searchPanelVisible.set(false);
    }
  }

  protected closeAsidePanel(): void {
    this.searchPanelVisible.set(false);
    this.annotationsPanelVisible.set(false);
  }

  protected openFieldSettingsPanel(): void {
    if (!this.selectedField()) {
      return;
    }

    this.searchPanelVisible.set(false);
    this.annotationsPanelVisible.set(false);
    this.fieldSettingsPanelVisible.set(true);
  }

  protected closeFieldSettingsPanel(): void {
    this.fieldSettingsPanelVisible.set(false);
  }

  protected selectRecipient(recipient: PdfBuilderRecipient, event?: Event): void {
    event?.stopPropagation();

    if (recipient.disabled) {
      return;
    }

    this.recipientSelected.emit(recipient);

    const field = this.getRecipientTargetField(recipient);

    if (!field) {
      return;
    }

    this.activePage.set(field.page);
    this.selectedFieldId.set(field.id);
    this.editingFieldId.set(null);
    this.scrollFieldIntoView(field.id);
  }

  protected requestAddRecipient(): void {
    this.addRecipient.emit();
  }

  protected updateRecipientSearch(query: string): void {
    this.recipientSearchQuery.set(query);
    this.recipientSearchChanged.emit(query);
  }

  protected requestCreateRecipientContact(event?: Event): void {
    event?.stopPropagation();
    this.createRecipientContact.emit(this.recipientSearchQuery().trim());
  }

  protected requestReplaceRecipient(recipient: PdfBuilderRecipient, event?: Event): void {
    event?.stopPropagation();
    this.replaceRecipient.emit(recipient);
  }

  protected requestRemoveRecipient(recipient: PdfBuilderRecipient, event?: Event): void {
    event?.stopPropagation();
    this.removeRecipient.emit(recipient);
  }

  protected openSelectedDatePicker(event?: Event): void {
    event?.stopPropagation();

    const field = this.selectedField();

    if (!field || field.type !== 'date' || field.locked) {
      return;
    }

    this.openDateFieldPicker(field);
  }

  protected getRecipientAvatarLabel(recipient: PdfBuilderRecipient): string {
    const explicitLabel = recipient.avatarLabel?.trim();

    if (explicitLabel) {
      return explicitLabel.slice(0, 2).toUpperCase();
    }

    return recipient.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  protected getRecipientRoleLabel(recipient: PdfBuilderRecipient): string {
    return recipient.role?.trim() || 'Recipient';
  }

  private getNormalizedSigners(): readonly PdfBuilderFieldSigner[] {
    const explicitSigners = this.signers()
      .filter(signer => signer.id.trim() && signer.fullName.trim())
      .map(signer => ({
        id: signer.id,
        fullName: signer.fullName.trim(),
        email: signer.email,
      }));

    if (explicitSigners.length) {
      return explicitSigners;
    }

    return this.recipientItems()
      .filter(recipient => this.getRecipientRoleLabel(recipient).toLowerCase() === 'signer')
      .map(recipient => ({
        id: recipient.id,
        fullName: recipient.name.trim(),
        email: recipient.email,
      }));
  }

  private getDefaultFieldSigner(): PdfBuilderFieldSigner | null {
    return this.signerItems()[0] ?? null;
  }

  protected isRecipientSelected(recipient: PdfBuilderRecipient): boolean {
    const selectedFieldId = this.selectedFieldId();

    return !!selectedFieldId && !!recipient.fieldIds?.includes(selectedFieldId);
  }

  private getRecipientTargetField(recipient: PdfBuilderRecipient): PdfBuilderField | null {
    const fieldIds = recipient.fieldIds ?? [];

    return this.fields().find(field => fieldIds.includes(field.id)) ?? null;
  }

  protected updatePdfSearch(event: { query: string; options: PdfViewerSearchOptions }): void {
    this.activeSearchQuery.set(event.query);
    this.pdfSearchResults.set(this.searchBuilderFields(event.query, event.options));
  }

  protected selectSearchResult(result: PdfViewerSearchResultView): void {
    this.activePage.set(result.pageNumber);

    if (typeof result.id === 'string' && this.fields().some(field => field.id === result.id)) {
      this.selectedFieldId.set(result.id);
      this.editingFieldId.set(null);
      this.scrollFieldIntoView(result.id);
      return;
    }

    this.scrollPageIntoView(result.pageNumber);
  }

  protected selectAnnotationPage(pageNumber: number): void {
    this.selectPage(pageNumber);
  }

  protected createBlankPdfDocument(): void {
    this.clearHistory();
    this.documentSource.set(null);
    this.documentName.set('Untitled.pdf');
    this.documentSizeLabel.set('Virtual PDF');
    this.setDocumentPages([this.createVirtualSchemaPage(1)]);
    this.activePage.set(1);
    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.fieldSettingsPanelVisible.set(false);
    this.fields.set([]);
    this.recordActivity('Virtual PDF created', 'A one-page virtual PDF is ready for fields.', 'fluent:document-add-24-regular');
    this.createBlankPdf.emit();
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  protected removePdf(): void {
    this.clearHistory();
    this.documentSource.set(null);
    this.documentName.set('Untitled.pdf');
    this.documentSizeLabel.set('Virtual PDF');
    this.setDocumentPages([this.createVirtualSchemaPage(1)]);
    this.activePage.set(1);
    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.fieldSettingsPanelVisible.set(false);
    this.fields.set([]);
    this.recordActivity('PDF removed', 'The virtual canvas is ready for fields.', 'fluent:dismiss-24-regular');
  }

  protected addBlankPage(): void {
    this.ensureDocumentPages();

    const nextPage = this.pageCount() + 1;

    this.setDocumentPages([...this.documentPages(), this.createVirtualSchemaPage(nextPage)]);
    this.activePage.set(nextPage);
    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.fieldSettingsPanelVisible.set(false);
    this.expandedLayerNodeIds.update(ids => new Set(ids).add(`page-${nextPage}`));
    this.recordActivity('Page added', `Blank Page ${nextPage} added to the PDF builder.`, 'fluent:document-one-page-add-24-regular');
    setTimeout(() => this.scrollPageIntoView(nextPage));
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  protected undo(): void {
    const previous = this.undoStack().at(-1);

    if (!previous) {
      return;
    }

    this.redoStack.update(stack => [...stack, this.captureHistoryState()]);
    this.undoStack.update(stack => stack.slice(0, -1));
    this.restoreHistoryState(previous);
    this.recordActivity('Undo', 'Last field change reverted.', 'fluent:arrow-undo-24-regular');
  }

  protected redo(): void {
    const next = this.redoStack().at(-1);

    if (!next) {
      return;
    }

    this.undoStack.update(stack => [...stack, this.captureHistoryState()]);
    this.redoStack.update(stack => stack.slice(0, -1));
    this.restoreHistoryState(next);
    this.recordActivity('Redo', 'Field change restored.', 'fluent:arrow-redo-24-regular');
  }

  private captureSchema(): PdfBuilderSchema {
    return {
      version: 1,
      document: {
        name: this.documentName(),
        source: this.documentSource(),
        sizeLabel: this.documentSizeLabel(),
        sourcePageCount: this.sourcePageCount(),
        addedPageCount: this.addedPageCount(),
        pages: this.documentPages().map(page => ({ ...page })),
      },
      view: {
        activePage: this.activePage(),
        selectedFieldId: this.selectedFieldId(),
        activeCanvasTool: this.activeCanvasTool(),
        pageStripVisible: this.pageStripVisible(),
        libraryCollapsed: this.libraryCollapsed(),
        searchPanelVisible: this.searchPanelVisible(),
        annotationsPanelVisible: this.annotationsPanelVisible(),
        spreadMode: this.spreadMode(),
        scrollLayout: this.scrollLayout(),
        pageRotation: this.pageRotation(),
        activeSearchQuery: this.activeSearchQuery(),
        expandedLayerNodeIds: Array.from(this.expandedLayerNodeIds()),
      },
      fields: this.fields().map(field => ({ ...field })),
    };
  }

  private restoreSchema(schema: PdfBuilderSchema): void {
    const documentSource = schema.document?.source ?? null;
    const pages = this.getSchemaPagesFromDocument(schema.document, documentSource);
    const pageCount = pages.length;
    const fields = (schema.fields ?? [])
      .filter(field => field.page >= 1 && field.page <= pageCount)
      .map(field => this.withDefaultFieldSigner(field));
    const view = schema.view;

    this.suppressNextSchemaChange = true;
    this.removePlacementEventListeners();
    this.removeFieldDragEventListeners();
    this.removeFieldResizeEventListeners();
    this.documentName.set(schema.document?.name ?? 'Untitled.pdf');
    this.documentSource.set(documentSource);
    this.documentSizeLabel.set(schema.document?.sizeLabel ?? (documentSource ? '' : 'Virtual PDF'));
    this.setDocumentPages(pages);
    this.fields.set(fields);
    this.activePage.set(this.clamp(Math.floor(view?.activePage ?? 1), 1, pageCount));
    this.pageStripVisible.set(view?.pageStripVisible ?? true);
    this.libraryCollapsed.set(view?.libraryCollapsed ?? false);
    this.searchPanelVisible.set(view?.searchPanelVisible ?? false);
    this.annotationsPanelVisible.set(view?.annotationsPanelVisible ?? false);
    this.spreadMode.set(this.normalizeSpreadMode(view?.spreadMode));
    this.scrollLayout.set(this.normalizeScrollLayout(view?.scrollLayout));
    this.pageRotation.set(this.normalizePageRotation(view?.pageRotation));
    this.expandedLayerNodeIds.set(new Set(view?.expandedLayerNodeIds ?? []));
    const selectedFieldId = fields.some(field => field.id === view?.selectedFieldId)
      ? view?.selectedFieldId ?? null
      : null;

    this.selectedFieldId.set(selectedFieldId);
    this.fieldSettingsPanelVisible.set(false);
    this.hoveredFieldId.set(null);
    this.editingFieldId.set(null);
    this.placementGhost.set(null);
    this.fieldDrag.set(null);
    this.fieldResize.set(null);
    this.activeCanvasTool.set(this.normalizeCanvasTool(view?.activeCanvasTool));
    this.activeSearchQuery.set(view?.activeSearchQuery ?? '');
    this.pdfSearchResults.set([]);
    this.undoStack.set([]);
    this.redoStack.set([]);
    this.syncFieldIdFromFields(fields);
  }

  private getSchemaPagesFromDocument(
    documentSchema: PdfBuilderSchema['document'] | undefined,
    source: PdfViewerSource | null,
  ): readonly PdfBuilderSchemaPage[] {
    const explicitPages = documentSchema?.pages;

    if (explicitPages?.length) {
      return this.normalizeSchemaPages(explicitPages, source);
    }

    const sourcePageCount = Math.max(0, Math.floor(documentSchema?.sourcePageCount ?? 0));
    const addedPageCount = Math.max(0, Math.floor(documentSchema?.addedPageCount ?? 0));
    const migratedPages = [
      ...this.createSourceSchemaPages(source ? sourcePageCount : 0),
      ...Array.from({ length: addedPageCount }, (_, index) =>
        this.createVirtualSchemaPage((source ? sourcePageCount : 0) + index + 1),
      ),
    ];

    return this.normalizeSchemaPages(migratedPages, source);
  }

  private normalizeSchemaPages(
    pages: readonly PdfBuilderSchemaPage[],
    source: PdfViewerSource | null = this.documentSource(),
  ): readonly PdfBuilderSchemaPage[] {
    const normalized = pages
      .map((page, index) => {
        const pageNumber = index + 1;
        const kind: PdfBuilderSchemaPageKind = source && page.kind === 'source' ? 'source' : 'virtual';
        const sourcePage = kind === 'source'
          ? Math.max(1, Math.floor(page.sourcePage ?? pageNumber))
          : undefined;

        return {
          id: page.id || `${kind}-${pageNumber}`,
          kind,
          label: page.label,
          sourcePage,
          width: page.width ?? PDF_BUILDER_PAGE_WIDTH,
          height: page.height ?? PDF_BUILDER_PAGE_HEIGHT,
        };
      });

    return normalized.length ? normalized : [this.createVirtualSchemaPage(1)];
  }

  private setDocumentPages(pages: readonly PdfBuilderSchemaPage[]): void {
    const normalized = this.normalizeSchemaPages(pages);

    this.documentPages.set(normalized);
    this.sourcePageCount.set(normalized.filter(page => page.kind === 'source').length);
    this.addedPageCount.set(normalized.filter(page => page.kind === 'virtual').length);
    this.expandedLayerNodeIds.update(ids => {
      const next = new Set(ids);

      for (let page = 1; page <= normalized.length; page++) {
        next.add(`page-${page}`);
      }

      return next;
    });
  }

  private ensureDocumentPages(): void {
    if (this.documentPages().length) {
      return;
    }

    this.setDocumentPages([this.createVirtualSchemaPage(1)]);
    this.activePage.set(1);
  }

  private createSourceSchemaPages(count: number): PdfBuilderSchemaPage[] {
    return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => {
      const pageNumber = index + 1;

      return {
        id: `source-${pageNumber}`,
        kind: 'source',
        label: pageNumber === 1 ? 'Cover' : `Page ${pageNumber}`,
        sourcePage: pageNumber,
        width: PDF_BUILDER_PAGE_WIDTH,
        height: PDF_BUILDER_PAGE_HEIGHT,
      };
    });
  }

  private createVirtualSchemaPage(pageNumber: number): PdfBuilderSchemaPage {
    return {
      id: `virtual-${pageNumber}`,
      kind: 'virtual',
      label: pageNumber === 1 ? 'Page 1' : `Page ${pageNumber}`,
      width: PDF_BUILDER_PAGE_WIDTH,
      height: PDF_BUILDER_PAGE_HEIGHT,
    };
  }

  private getSchemaPage(pageNumber: number): PdfBuilderSchemaPage | null {
    return this.documentPages()[pageNumber - 1] ?? null;
  }

  protected duplicateSelectedField(): void {
    const field = this.selectedField();

    if (!field) {
      return;
    }

    const duplicate = {
      ...field,
      id: this.nextFieldId(field.type),
      label: `${field.label} copy`,
      slot: this.nextSlot(),
      x: field.x + 24,
      y: field.y + 24,
      locked: false,
    };

    this.commitFields(fields => [...fields, duplicate]);
    this.selectedFieldId.set(duplicate.id);
    this.editingFieldId.set(null);
    this.recordActivity('Field duplicated', `${duplicate.label} created.`, duplicate.icon);
  }

  protected deleteSelectedField(): void {
    const field = this.selectedField();

    if (!field || field.locked) {
      return;
    }

    this.commitFields(fields => fields.filter(item => item.id !== field.id));
    this.selectedFieldId.set(null);
    this.editingFieldId.set(null);
    this.fieldSettingsPanelVisible.set(false);
    this.recordActivity('Field deleted', `${field.label} removed from Page ${field.page}.`, 'fluent:delete-24-regular');
  }

  protected toggleSelectedFieldLock(): void {
    const field = this.selectedField();

    if (!field) {
      return;
    }

    this.updateSelectedField('locked', !field.locked);
  }

  protected toggleSelectedFieldRequired(): void {
    const field = this.selectedField();

    if (!field || field.locked) {
      return;
    }

    this.updateSelectedField('required', !field.required);
  }

  protected assignSelectedFieldRecipient(recipient: PdfBuilderRecipient, event?: Event): void {
    event?.stopPropagation();

    const field = this.selectedField();

    if (!field || field.locked || recipient.disabled) {
      return;
    }

    this.updateSelectedField('signer', {
      id: recipient.id,
      fullName: recipient.name.trim(),
      email: recipient.email,
    });
    this.recordActivity(
      'Recipient updated',
      `${field.label} assigned to ${recipient.name.trim()}.`,
      'fluent:person-24-regular',
    );
  }

  protected updateSelectedField<K extends keyof PdfBuilderField>(
    key: K,
    value: PdfBuilderField[K],
  ): void {
    const field = this.selectedField();

    if (!field || field.locked && key !== 'locked') {
      return;
    }

    this.commitFields(fields =>
      fields.map(item => {
        if (item.id !== field.id) {
          return item;
        }

        const nextField = { ...item, [key]: value };

        return this.shouldAutosizeField(key, nextField)
          ? this.withAutosizedTextMetrics(nextField)
          : nextField;
      }),
    );
  }

  private async applyStampDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderStampDialogResult,
  ): Promise<void> {
    const currentField = this.fields().find(item => item.id === field.id);

    if (!currentField || currentField.type !== 'stamp' || currentField.locked) {
      return;
    }

    const stampLabel = result.type === 'asset' ? result.stamp.name : result.file.name;
    const stampValue = result.type === 'asset'
      ? result.stamp.dataUrl?.trim() || result.stamp.imageUrl?.trim() || stampLabel
      : await this.readImageFileAsDataUrl(result.file);
    const appliedField = { ...currentField, label: stampLabel, value: stampValue };

    this.commitFields(fields =>
      fields.map(item => item.id === currentField.id ? appliedField : item),
    );
    this.selectedFieldId.set(currentField.id);

    if (result.type === 'asset') {
      this.stampSelected.emit({ field: appliedField, stamp: result.stamp });
      this.recordActivity('Stamp selected', `${stampLabel} applied.`, currentField.icon);
      return;
    }

    this.stampUploaded.emit({ field: appliedField, file: result.file });
    this.recordActivity('Stamp uploaded', `${stampLabel} applied.`, currentField.icon);
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

  private async applySignatureDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<void> {
    const currentField = this.fields().find(item => item.id === field.id);

    if (!currentField || currentField.type !== 'signature' || currentField.locked) {
      return;
    }

    const uploadResult = await this.resolveSignatureUploadResult(currentField, result);
    const signatureLabel = this.getSignatureResultLabel(
      uploadResult,
      this.getSignatureDialogResultLabel(result),
    );
    const signatureValue = this.getSignatureResultValue(
      uploadResult,
      this.getSignatureDialogResultValue(result),
    );
    const appliedField = { ...currentField, label: signatureLabel, value: signatureValue };

    this.commitFields(fields =>
      fields.map(item => item.id === currentField.id ? appliedField : item),
    );
    this.selectedFieldId.set(currentField.id);

    if (result.type === 'asset') {
      this.signatureSelected.emit({ field: appliedField, signature: result.signature });
      this.recordActivity('Signature selected', `${signatureLabel} applied.`, currentField.icon);
      return;
    }

    if (result.type === 'draw') {
      this.signatureDrawn.emit({ field: appliedField, dataUrl: result.dataUrl });
      this.recordActivity('Signature drawn', 'Drawn signature applied.', currentField.icon);
      return;
    }

    if (result.type === 'type') {
      this.signatureTyped.emit({
        field: appliedField,
        value: result.value,
        dataUrl: result.dataUrl,
        fontFamily: result.fontFamily,
        color: result.color,
      });
      this.recordActivity('Signature typed', `${signatureLabel} applied.`, currentField.icon);
      return;
    }

    this.signatureUploaded.emit({ field: appliedField, file: result.file });
    this.recordActivity('Signature uploaded', `${signatureLabel} applied.`, currentField.icon);
  }

  private async applyInitialsDialogResult(
    field: PdfBuilderField,
    result: PdfBuilderSignatureDialogResult,
  ): Promise<void> {
    const currentField = this.fields().find(item => item.id === field.id);

    if (!currentField || currentField.type !== 'initials' || currentField.locked || result.type === 'draw') {
      return;
    }

    const uploadResult = await this.resolveInitialsUploadResult(currentField, result);
    const initialsLabel = this.getSignatureResultLabel(
      uploadResult,
      this.getSignatureDialogResultLabel(result),
    );
    const initialsValue = this.getSignatureResultValue(
      uploadResult,
      this.getSignatureDialogResultValue(result),
    );
    const appliedField = { ...currentField, label: initialsLabel, value: initialsValue };

    this.commitFields(fields =>
      fields.map(item => item.id === currentField.id ? appliedField : item),
    );
    this.selectedFieldId.set(currentField.id);

    if (result.type === 'asset') {
      this.initialsSelected.emit({ field: appliedField, initials: result.signature });
      this.recordActivity('Initials selected', `${initialsLabel} applied.`, currentField.icon);
      return;
    }

    if (result.type === 'type') {
      this.initialsTyped.emit({
        field: appliedField,
        value: result.value,
        dataUrl: result.dataUrl,
        fontFamily: result.fontFamily,
        color: result.color,
      });
      this.recordActivity('Initials typed', `${initialsLabel} applied.`, currentField.icon);
      return;
    }

    this.initialsUploaded.emit({ field: appliedField, file: result.file });
    this.recordActivity('Initials uploaded', `${initialsLabel} applied.`, currentField.icon);
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

  private getSignatureDialogResultLabel(result: PdfBuilderSignatureDialogResult): string {
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

  private getSignatureDialogResultValue(result: PdfBuilderSignatureDialogResult): string {
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

  protected exportCurrentPdf(): void {
    this.downloadCurrentPdf();
    this.recordActivity('PDF exported', `${this.documentName()} downloaded.`, 'fluent:document-pdf-24-regular');
    this.exportPdf.emit();
  }

  private restoreLayerTreeExpansion(): void {
    const tree = this.layersTree();

    if (!tree) {
      return;
    }

    for (const node of this.flattenLayerTree(this.layerTree())) {
      if (node.children?.length && this.expandedLayerNodeIds().has(node.id)) {
        tree.expand(node);
      }
    }
  }

  private scheduleLayerTreeExpansionRestore(): void {
    if (this.layerExpansionRestoreScheduled) {
      return;
    }

    this.layerExpansionRestoreScheduled = true;
    this.scheduleDomSync(() => {
      this.layerExpansionRestoreScheduled = false;
      this.restoreLayerTreeExpansion();
    });
  }

  private flattenLayerTree(nodes: readonly PdfBuilderLayerNode[]): PdfBuilderLayerNode[] {
    return nodes.flatMap(node => [node, ...this.flattenLayerTree(node.children ?? [])]);
  }

  private getLayerMeta(field: PdfBuilderField): string | undefined {
    if (field.locked) {
      return 'locked';
    }

    return undefined;
  }

  private getFieldSearchExcerpt(field: PdfBuilderField): string {
    const value = field.value.trim();

    return value ? `${field.label}: ${value}` : `${field.label} field on Page ${field.page}.`;
  }

  private searchBuilderFields(query: string, options: PdfViewerSearchOptions): PdfViewerSearchResultView[] {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const queryValue = options.caseSensitive ? normalizedQuery : normalizedQuery.toLocaleLowerCase();

    const results: PdfViewerSearchResultView[] = [];

    for (const field of this.fields()) {
      const haystack = [field.label, field.value, field.binding, field.type, `page ${field.page}`]
        .filter(Boolean)
        .join(' ');
      const searchable = options.caseSensitive ? haystack : haystack.toLocaleLowerCase();
      const matches = options.wholeWord
        ? new RegExp(`\\b${this.escapeRegExp(queryValue)}\\b`).test(searchable)
        : searchable.includes(queryValue);

      if (matches) {
        results.push({
          id: field.id,
          pageNumber: field.page,
          excerpt: this.getFieldSearchExcerpt(field),
        });
      }
    }

    return results;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private movePlacementGhost(event: PointerEvent): void {
    const ghost = this.placementGhost();

    if (!ghost) {
      return;
    }

    event.preventDefault();

    const pagePoint = this.getPdfPointFromClient(event.clientX, event.clientY);
    const pageMetrics = pagePoint ? this.getPlacementFieldMetrics(ghost.type, pagePoint.x, pagePoint.y) : null;

    this.placementGhost.set({
      ...ghost,
      clientX: event.clientX,
      clientY: event.clientY,
      overPage: !!pagePoint,
      page: pagePoint?.page ?? null,
      pageX: pageMetrics?.x ?? null,
      pageY: pageMetrics?.y ?? null,
    });

    if (pagePoint && pagePoint.page !== this.activePage()) {
      this.activePage.set(pagePoint.page);
    }
  }

  private finishPlacement(event: PointerEvent): void {
    const ghost = this.placementGhost();

    if (!ghost) {
      return;
    }

    event.preventDefault();

    this.removePlacementEventListeners();
    this.placementGhost.set(null);

    if (!ghost.overPage || ghost.page === null || ghost.pageX === null || ghost.pageY === null) {
      return;
    }

    const field = this.createField(ghost.type, {
      page: ghost.page,
      slot: this.getDefaultSlotForType(ghost.type),
      x: ghost.pageX,
      y: ghost.pageY,
      width: Math.round(ghost.width),
      height: Math.round(ghost.height),
    });

    this.commitFields(fields => [...fields, field]);
    this.selectedFieldId.set(field.id);
    this.recordActivity('Field added', `${field.label} placed on Page ${field.page}.`, field.icon);
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  private cancelPlacement(): void {
    this.removePlacementEventListeners();
    this.placementGhost.set(null);
  }

  private moveDraggedField(event: PointerEvent): void {
    const drag = this.fieldDrag();

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    event.preventDefault();

    const scale = this.getRenderedPageScale(drag.page);
    const deltaX = (event.clientX - drag.originClientX) / scale.x;
    const deltaY = (event.clientY - drag.originClientY) / scale.y;
    const maxX = Math.max(0, PDF_BUILDER_PAGE_WIDTH - drag.width);
    const maxY = Math.max(0, PDF_BUILDER_PAGE_HEIGHT - drag.height);
    const x = this.clamp(drag.startX + deltaX, 0, maxX);
    const y = this.clamp(drag.startY + deltaY, 0, maxY);
    const moved = drag.moved ||
      Math.abs(event.clientX - drag.originClientX) > 3 ||
      Math.abs(event.clientY - drag.originClientY) > 3;

    this.fields.update(fields =>
      fields.map(field =>
        field.id === drag.fieldId
          ? { ...field, x, y }
          : field,
      ),
    );

    if (moved !== drag.moved) {
      this.fieldDrag.set({ ...drag, moved });
    }
  }

  private finishFieldDrag(event: PointerEvent): void {
    const drag = this.fieldDrag();

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    event.preventDefault();
    this.removeFieldDragEventListeners();
    this.fieldDrag.set(null);

    const currentField = this.fields().find(field => field.id === drag.fieldId);
    const initialField = drag.initialFields.find(field => field.id === drag.fieldId);
    const changed = !!currentField &&
      !!initialField &&
      (currentField.x !== initialField.x || currentField.y !== initialField.y);

    if (!changed) {
      return;
    }

    this.undoStack.update(stack => [
      ...stack.slice(-19),
      {
        fields: drag.initialFields.map(field => ({ ...field })),
        selectedFieldId: drag.initialSelectedFieldId,
        activePage: drag.initialActivePage,
      },
    ]);
    this.redoStack.set([]);
    this.suppressNextFieldClick(drag.fieldId);
  }

  private cancelFieldDrag(): void {
    const drag = this.fieldDrag();

    this.removeFieldDragEventListeners();
    this.fieldDrag.set(null);

    if (!drag) {
      return;
    }

    this.fields.set(drag.initialFields.map(field => ({ ...field })));
    this.selectedFieldId.set(drag.initialSelectedFieldId);
    this.activePage.set(drag.initialActivePage);
  }

  private resizeField(event: PointerEvent): void {
    const resize = this.fieldResize();

    if (!resize || event.pointerId !== resize.pointerId) {
      return;
    }

    event.preventDefault();

    const currentField = this.fields().find(field => field.id === resize.fieldId);

    if (!currentField) {
      return;
    }

    const scale = this.getRenderedPageScale(resize.page);
    const minimumMetrics = this.getMinimumResizeMetrics(currentField);
    const deltaX = (event.clientX - resize.originClientX) / scale.x;
    const deltaY = (event.clientY - resize.originClientY) / scale.y;
    let width: number;
    let height: number;

    if (currentField.type === 'checkbox') {
      const baseSide = this.getDefaultMetricsForType('checkbox').width;
      const maxSide = Math.max(
        baseSide,
        Math.min(baseSide * 2, PDF_BUILDER_PAGE_WIDTH - resize.startX, PDF_BUILDER_PAGE_HEIGHT - resize.startY),
      );
      const side = Math.round(this.clamp(resize.startWidth + Math.max(deltaX, deltaY), baseSide, maxSide));

      width = side;
      height = side;
    } else {
      const maxWidth = Math.max(minimumMetrics.width, PDF_BUILDER_PAGE_WIDTH - resize.startX);
      const maxHeight = Math.max(minimumMetrics.height, PDF_BUILDER_PAGE_HEIGHT - resize.startY);

      width = Math.round(this.clamp(resize.startWidth + deltaX, minimumMetrics.width, maxWidth));
      height = currentField.type === 'variable' || currentField.type === 'date'
        ? resize.startHeight
        : Math.round(this.clamp(resize.startHeight + deltaY, minimumMetrics.height, maxHeight));
    }
    const moved = resize.moved ||
      Math.abs(event.clientX - resize.originClientX) > 3 ||
      Math.abs(event.clientY - resize.originClientY) > 3;

    this.fields.update(fields =>
      fields.map(field =>
        field.id === resize.fieldId
          ? { ...field, width, height }
          : field,
      ),
    );

    if (moved !== resize.moved) {
      this.fieldResize.set({ ...resize, moved });
    }
  }

  private finishFieldResize(event: PointerEvent): void {
    const resize = this.fieldResize();

    if (!resize || event.pointerId !== resize.pointerId) {
      return;
    }

    event.preventDefault();
    this.removeFieldResizeEventListeners();
    this.fieldResize.set(null);

    const currentField = this.fields().find(field => field.id === resize.fieldId);
    const initialField = resize.initialFields.find(field => field.id === resize.fieldId);
    const changed = !!currentField &&
      !!initialField &&
      (currentField.width !== initialField.width || currentField.height !== initialField.height);

    if (!changed) {
      return;
    }

    this.undoStack.update(stack => [
      ...stack.slice(-19),
      {
        fields: resize.initialFields.map(field => ({ ...field })),
        selectedFieldId: resize.initialSelectedFieldId,
        activePage: resize.initialActivePage,
      },
    ]);
    this.redoStack.set([]);
    this.suppressNextFieldClick(resize.fieldId);
  }

  private cancelFieldResize(): void {
    const resize = this.fieldResize();

    this.removeFieldResizeEventListeners();
    this.fieldResize.set(null);

    if (!resize) {
      return;
    }

    this.fields.set(resize.initialFields.map(field => ({ ...field })));
    this.selectedFieldId.set(resize.initialSelectedFieldId);
    this.activePage.set(resize.initialActivePage);
  }

  private addPlacementEventListeners(): void {
    this.removePlacementEventListeners();

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    defaultView.addEventListener('pointermove', this.handlePlacementPointerMove, { passive: false });
    defaultView.addEventListener('pointerup', this.handlePlacementPointerUp, { passive: false });
    defaultView.addEventListener('pointercancel', this.handlePlacementPointerCancel);
    defaultView.addEventListener('blur', this.handlePlacementPointerCancel);

    this.removePlacementListeners = () => {
      defaultView.removeEventListener('pointermove', this.handlePlacementPointerMove);
      defaultView.removeEventListener('pointerup', this.handlePlacementPointerUp);
      defaultView.removeEventListener('pointercancel', this.handlePlacementPointerCancel);
      defaultView.removeEventListener('blur', this.handlePlacementPointerCancel);
    };
  }

  private removePlacementEventListeners(): void {
    this.removePlacementListeners?.();
    this.removePlacementListeners = null;
  }

  private addFieldDragEventListeners(): void {
    this.removeFieldDragEventListeners();

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    defaultView.addEventListener('pointermove', this.handleFieldDragPointerMove, { passive: false });
    defaultView.addEventListener('pointerup', this.handleFieldDragPointerUp, { passive: false });
    defaultView.addEventListener('pointercancel', this.handleFieldDragPointerCancel);
    defaultView.addEventListener('blur', this.handleFieldDragPointerCancel);

    this.removeFieldDragListeners = () => {
      defaultView.removeEventListener('pointermove', this.handleFieldDragPointerMove);
      defaultView.removeEventListener('pointerup', this.handleFieldDragPointerUp);
      defaultView.removeEventListener('pointercancel', this.handleFieldDragPointerCancel);
      defaultView.removeEventListener('blur', this.handleFieldDragPointerCancel);
    };
  }

  private removeFieldDragEventListeners(): void {
    this.removeFieldDragListeners?.();
    this.removeFieldDragListeners = null;
  }

  private addFieldResizeEventListeners(): void {
    this.removeFieldResizeEventListeners();

    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    defaultView.addEventListener('pointermove', this.handleFieldResizePointerMove, { passive: false });
    defaultView.addEventListener('pointerup', this.handleFieldResizePointerUp, { passive: false });
    defaultView.addEventListener('pointercancel', this.handleFieldResizePointerCancel);
    defaultView.addEventListener('blur', this.handleFieldResizePointerCancel);

    this.removeFieldResizeListeners = () => {
      defaultView.removeEventListener('pointermove', this.handleFieldResizePointerMove);
      defaultView.removeEventListener('pointerup', this.handleFieldResizePointerUp);
      defaultView.removeEventListener('pointercancel', this.handleFieldResizePointerCancel);
      defaultView.removeEventListener('blur', this.handleFieldResizePointerCancel);
    };
  }

  private removeFieldResizeEventListeners(): void {
    this.removeFieldResizeListeners?.();
    this.removeFieldResizeListeners = null;
  }

  private getPdfPointFromClient(clientX: number, clientY: number): { page: number; x: number; y: number } | null {
    const pageShells = this.getPageShellElements();

    if (!pageShells.length) {
      return null;
    }

    for (const pageShell of pageShells) {
      const rect = this.getElementClientRect(pageShell);

      if (!rect) {
        continue;
      }

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        continue;
      }

      const page = this.getPageNumberFromShell(pageShell);

      if (!page) {
        continue;
      }

      const xScale = rect.width / PDF_BUILDER_PAGE_WIDTH;
      const yScale = rect.height / PDF_BUILDER_PAGE_HEIGHT;

      return {
        page,
        x: this.clamp((clientX - rect.left) / xScale, 0, PDF_BUILDER_PAGE_WIDTH),
        y: this.clamp((clientY - rect.top) / yScale, 0, PDF_BUILDER_PAGE_HEIGHT),
      };
    }

    return null;
  }

  private getPlacementFieldMetrics(
    type: PdfBuilderFieldType,
    pageX: number,
    pageY: number,
  ): Pick<PdfBuilderField, 'x' | 'y' | 'width' | 'height'> {
    const metrics = this.getDefaultMetricsForType(type);
    const width = Math.min(metrics.width, PDF_BUILDER_PAGE_WIDTH);
    const height = Math.min(metrics.height, PDF_BUILDER_PAGE_HEIGHT);

    return {
      x: this.clamp(pageX, 0, PDF_BUILDER_PAGE_WIDTH - width),
      y: this.clamp(pageY, 0, PDF_BUILDER_PAGE_HEIGHT - height),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  private syncPageGeometry(): void {
    const pageShells = this.getPageShellElements();

    if (!pageShells.length) {
      return;
    }

    const scale = this.pdfScale();
    const width = PDF_BUILDER_PAGE_WIDTH * scale;
    const height = PDF_BUILDER_PAGE_HEIGHT * scale;

    for (const pageShell of pageShells) {
      this.setCssVar(pageShell, '--pdf-builder-page-width', `${width}px`);
      this.setCssVar(pageShell, '--pdf-builder-page-height', `${height}px`);
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

      this.setCssVar(element, '--pdf-builder-field-left', `${field.x * scale.x}px`);
      this.setCssVar(element, '--pdf-builder-field-top', `${field.y * scale.y}px`);
      this.setCssVar(element, '--pdf-builder-field-width', `${field.width * scale.x}px`);
      this.setCssVar(element, '--pdf-builder-field-height', `${field.height * scale.y}px`);
    }

    for (const element of this.getSelectionToolbarElements()) {
      const fieldId = element.getAttribute('data-selection-toolbar-field-id');
      const field = fieldId ? fields.get(fieldId) : null;

      if (!field) {
        continue;
      }

      const scale = this.getRenderedPageScale(field.page);

      this.setCssVar(
        element,
        '--pdf-builder-toolbar-left',
        `${(field.x + field.width / 2) * scale.x}px`,
      );
      this.setCssVar(element, '--pdf-builder-toolbar-top', `${field.y * scale.y}px`);
    }
  }

  private shouldAutosizeField<K extends keyof PdfBuilderField>(
    key: K,
    field: PdfBuilderField,
  ): key is Extract<K, PdfBuilderAutosizeKey> {
    return (key === 'label' || key === 'value') && field.type !== 'stamp';
  }

  private withAutosizedTextMetrics(field: PdfBuilderField): PdfBuilderField {
    const scale = this.getRenderedPageScale(field.page);
    const minimumMetrics = this.getDefaultMetricsForType(field.type);
    const displayedValue = field.value && field.type !== 'signature' && field.type !== 'initials' && field.type !== 'stamp'
      ? field.value
      : '';
    const labelWidth = this.measureOverlayText(field.label, 'label') + 46;
    const valueWidth = displayedValue ? this.measureOverlayText(displayedValue, 'value') + 24 : 0;
    const minimumWidth = minimumMetrics.width * scale.x;
    const desiredWidth = Math.ceil(Math.max(minimumWidth, labelWidth, valueWidth) / scale.x);
    const desiredHeight = Math.ceil(Math.max(
      field.height,
      minimumMetrics.height,
      (displayedValue ? 50 : 36) / scale.y,
    ));
    const pageInset = 8;
    const maxWidth = Math.max(32, PDF_BUILDER_PAGE_WIDTH - pageInset * 2);
    const maxHeight = Math.max(24, PDF_BUILDER_PAGE_HEIGHT - pageInset * 2);
    const width = Math.min(maxWidth, Math.max(field.width, desiredWidth));
    const height = Math.min(maxHeight, Math.max(field.height, desiredHeight));
    const x = this.clamp(field.x, pageInset, PDF_BUILDER_PAGE_WIDTH - pageInset - width);
    const y = this.clamp(field.y, pageInset, PDF_BUILDER_PAGE_HEIGHT - pageInset - height);

    return {
      ...field,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  private withContentEditableTextMetrics(field: PdfBuilderField, editor: HTMLElement): PdfBuilderField {
    const scale = this.getRenderedPageScale(field.page);
    const minimumMetrics = this.getDefaultMetricsForType(field.type);
    const pageInset = 8;
    const contentHeight = Math.max(editor.scrollHeight, this.getContentEditableContentHeight(editor));
    const lineHeight = this.getContentEditableLineHeight(editor);
    const hasExplicitLineBreak = (field.value || editor.textContent || '').includes('\n');
    const isMultiline = hasExplicitLineBreak || contentHeight > lineHeight * 1.55;
    const verticalChrome = this.getElementVerticalChrome(editor);
    const editorHeight = isMultiline
      ? Math.ceil((contentHeight + verticalChrome + 2) / scale.y)
      : minimumMetrics.height;
    const maxHeight = Math.max(minimumMetrics.height, PDF_BUILDER_PAGE_HEIGHT - pageInset - field.y);
    const height = this.clamp(editorHeight, minimumMetrics.height, maxHeight);

    return {
      ...field,
      height: Math.round(height),
    };
  }

  private getContentEditableContentHeight(editor: HTMLElement): number {
    const range = this.document.createRange();

    range.selectNodeContents(editor);
    const height = range.getBoundingClientRect().height;
    range.detach();

    return height;
  }

  private getContentEditableLineHeight(editor: HTMLElement): number {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return 20;
    }

    const style = defaultView.getComputedStyle(editor);
    const lineHeight = Number.parseFloat(style.lineHeight);

    if (Number.isFinite(lineHeight)) {
      return lineHeight;
    }

    const fontSize = Number.parseFloat(style.fontSize);

    return Number.isFinite(fontSize) ? fontSize * 1.25 : 20;
  }

  private getElementVerticalChrome(element: HTMLElement): number {
    const defaultView = this.document.defaultView;
    const fieldElement = element.closest<HTMLElement>('.overlay-field');

    if (!defaultView || !fieldElement) {
      return 0;
    }

    const style = defaultView.getComputedStyle(fieldElement);

    return [
      style.paddingTop,
      style.paddingBottom,
      style.borderTopWidth,
      style.borderBottomWidth,
    ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
  }

  private measureOverlayText(text: string, variant: 'label' | 'value'): number {
    const defaultView = this.document.defaultView;
    const canvas = this.document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return text.length * (variant === 'label' ? 8 : 9);
    }

    const fontFamily = defaultView
      ? defaultView.getComputedStyle(this.elementRef.nativeElement).fontFamily
      : 'sans-serif';
    context.font = variant === 'label'
      ? `600 13px ${fontFamily}`
      : `500 14px ${fontFamily}`;

    return context.measureText(text).width;
  }

  private syncPlacementGhostGeometry(): void {
    const ghost = this.placementGhost();
    const element = this.getPlacementGhostElement();

    if (!ghost || !element) {
      return;
    }

    const scale = ghost.page ? this.getRenderedPageScale(ghost.page) : this.getCanvasScale();
    const pageShell = ghost.page ? this.getPageShellElement(ghost.page) : null;
    let left = ghost.clientX;
    let top = ghost.clientY;

    if (pageShell && ghost.pageX !== null && ghost.pageY !== null) {
      const rect = this.getElementClientRect(pageShell);

      if (rect) {
        const ghostLeft = rect.left + ghost.pageX * scale.x;
        const ghostTop = rect.top + ghost.pageY * scale.y;

        left = ghostLeft;
        top = ghostTop;
      }
    }

    this.setCssVar(element, '--pdf-builder-ghost-left', `${left}px`);
    this.setCssVar(element, '--pdf-builder-ghost-top', `${top}px`);
    this.setCssVar(element, '--pdf-builder-ghost-width', `${ghost.width * scale.x}px`);
    this.setCssVar(element, '--pdf-builder-ghost-height', `${ghost.height * scale.y}px`);
  }

  private getRenderedPageScale(pageNumber = this.activePage()): { x: number; y: number } {
    const pageShell = this.getPageShellElement(pageNumber);

    if (!pageShell) {
      const scale = this.pdfScale();
      return { x: scale, y: scale };
    }

    const rect = this.getElementClientRect(pageShell);

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      const scale = this.pdfScale();
      return { x: scale, y: scale };
    }

    return {
      x: rect.width / PDF_BUILDER_PAGE_WIDTH,
      y: rect.height / PDF_BUILDER_PAGE_HEIGHT,
    };
  }

  private getCanvasScale(): { x: number; y: number } {
    const scale = this.pdfScale();

    return { x: scale, y: scale };
  }

  private getElementClientRect(element: Element): DOMRect | null {
    return typeof element.getBoundingClientRect === 'function'
      ? element.getBoundingClientRect()
      : null;
  }

  private schedulePageGeometrySync(): void {
    this.scheduleDomSync(() => this.syncPageGeometry());
  }

  private scheduleOverlayGeometrySync(): void {
    this.scheduleDomSync(() => this.syncOverlayGeometry());
  }

  private schedulePlacementGhostGeometrySync(): void {
    this.scheduleDomSync(() => this.syncPlacementGhostGeometry());
  }

  private syncCanvasGeometry(): void {
    this.syncPageGeometry();
    this.syncOverlayGeometry();
    this.syncPlacementGhostGeometry();
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

  private getPageShellElement(pageNumber = this.activePage()): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(`.pdf-page-shell[data-page-number="${pageNumber}"]`);
  }

  private getPageShellElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.pdf-page-shell'));
  }

  private getPageNumberFromShell(pageShell: HTMLElement): number | null {
    const value = Number(pageShell.getAttribute('data-page-number'));
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private getViewerScrollElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.viewer-scrollbar .scrollable-content');
  }

  private scrollPageIntoView(pageNumber: number): void {
    this.scheduleDomSync(() => {
      this.getPageShellElement(pageNumber)?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      });
    });
  }

  private scrollFieldIntoView(fieldId: string): void {
    this.scheduleDomSync(() => {
      this.getOverlayFieldElement(fieldId)?.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
      });
    });
  }

  private getOverlayFieldElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-field-id]'));
  }

  private getOverlayFieldElement(fieldId: string): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(`[data-field-id="${fieldId}"]`);
  }

  private getSelectionToolbarElements(): HTMLElement[] {
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-selection-toolbar-field-id]'),
    );
  }

  private getPlacementGhostElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.placement-ghost');
  }

  private getDatePickerAnchorElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.date-picker-anchor');
  }

  private getTextFieldEditorElement(fieldId: string): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(`[contenteditable][data-text-editor-for="${fieldId}"]`);
  }

  private placeContentEditableCaretAtEnd(editor: HTMLElement): void {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      return;
    }

    const range = this.document.createRange();
    const lastTextNode = this.getLastTextNode(editor);

    if (lastTextNode) {
      range.setStart(lastTextNode, lastTextNode.data.length);
    } else {
      range.setStart(editor, editor.childNodes.length);
    }

    range.collapse(true);
    const selection = defaultView.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private getLastTextNode(node: Node): Text | null {
    for (let index = node.childNodes.length - 1; index >= 0; index--) {
      const child = node.childNodes.item(index);

      if (child.nodeType === Node.TEXT_NODE) {
        return child as Text;
      }

      const nested = this.getLastTextNode(child);

      if (nested) {
        return nested;
      }
    }

    return null;
  }

  private suppressNextFieldClick(fieldId: string): void {
    this.suppressFieldClickId = fieldId;

    this.document.defaultView?.setTimeout(() => {
      if (this.suppressFieldClickId === fieldId) {
        this.suppressFieldClickId = null;
      }
    });
  }

  private setCssVar(element: HTMLElement, name: string, value: string): void {
    this.renderer.setStyle(element, name, value, RendererStyleFlags2.DashCase);
  }

  private setDragCursorLocked(locked: boolean): void {
    if (this.dragCursorLocked === locked) {
      return;
    }

    const body = this.document.body;

    if (!body) {
      this.dragCursorLocked = locked;
      return;
    }

    if (locked) {
      this.renderer.addClass(body, this.dragCursorClass);
    } else {
      this.renderer.removeClass(body, this.dragCursorClass);
    }

    this.dragCursorLocked = locked;
  }

  private createField(
    type: PdfBuilderFieldType,
    placement?: Partial<Pick<PdfBuilderField, 'page' | 'slot' | 'x' | 'y' | 'width' | 'height'>>,
  ): PdfBuilderField {
    const tool = this.tools().find(item => item.type === type);
    const slot = placement?.slot ?? this.nextSlot();
    const id = this.nextFieldId(type);
    const binding = this.getDefaultBinding(type, id);

    return {
      id,
      type,
      page: placement?.page ?? this.activePage(),
      label: this.getDefaultLabel(type, tool?.label),
      binding,
      value: this.getDefaultValue(type, binding),
      signer: this.getDefaultFieldSigner(),
      icon: tool?.icon ?? 'fluent:form-24-regular',
      slot,
      ...this.getSlotMetrics(slot),
      ...placement,
      required: type === 'signature' || type === 'initials',
      readonly: type === 'stamp',
      locked: false,
    };
  }

  private withDefaultFieldSigner(field: PdfBuilderField): PdfBuilderField {
    if (field.signer !== undefined) {
      return { ...field };
    }

    return {
      ...field,
      signer: this.getDefaultFieldSigner(),
    };
  }

  private nextFieldId(type: PdfBuilderFieldType): string {
    this.fieldId += 1;
    return `field-${type}-${this.fieldId}`;
  }

  private nextSlot(): PdfBuilderFieldSlot {
    const slots: PdfBuilderFieldSlot[] = ['primary', 'date', 'checkbox', 'signature', 'initials', 'footer', 'side', 'comment'];
    return slots[this.fields().length % slots.length];
  }

  private getSlotMetrics(slot: PdfBuilderFieldSlot): Pick<PdfBuilderField, 'x' | 'y' | 'width' | 'height'> {
    switch (slot) {
      case 'date':
        return { x: 96, y: 220, width: 118, height: 28 };
      case 'signature':
        return { x: 384, y: 711, width: 154, height: 42 };
      case 'initials':
        return { x: 384, y: 612, width: 105, height: 42 };
      case 'checkbox':
        return { x: 453, y: 282, width: 16, height: 16 };
      case 'comment':
        return { x: 96, y: 160, width: 120, height: 77 };
      case 'footer':
        return { x: 96, y: 690, width: 137, height: 25 };
      case 'side':
        return { x: 390, y: 186, width: 104, height: 34 };
      default:
        return { x: 96, y: 160, width: 168, height: 28 };
    }
  }

  private getDefaultMetricsForType(type: PdfBuilderFieldType): Pick<PdfBuilderField, 'width' | 'height'> {
    return this.getSlotMetrics(this.getDefaultSlotForType(type));
  }

  private getMinimumResizeMetrics(field: PdfBuilderField): Pick<PdfBuilderField, 'width' | 'height'> {
    if (field.type === 'variable') {
      return { width: 72, height: field.height };
    }

    if (field.type === 'date') {
      return { width: 82, height: field.height };
    }

    return this.getDefaultMetricsForType(field.type);
  }

  private getDefaultSlotForType(type: PdfBuilderFieldType): PdfBuilderFieldSlot {
    switch (type) {
      case 'signature':
        return 'signature';
      case 'initials':
        return 'initials';
      case 'date':
        return 'date';
      case 'checkbox':
        return 'checkbox';
      case 'stamp':
        return 'comment';
      default:
        return 'primary';
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private normalizeSpreadMode(value: unknown): PdfBuilderSpreadMode {
    return value === 'two-odd' || value === 'two-even' ? value : 'single';
  }

  private normalizeScrollLayout(value: unknown): PdfBuilderScrollLayout {
    return value === 'horizontal' ? 'horizontal' : 'vertical';
  }

  private normalizeCanvasTool(value: unknown): PdfBuilderCanvasTool {
    return value === 'pan' || value === 'text' ? value : 'select';
  }

  private syncFieldIdFromFields(fields: readonly PdfBuilderField[]): void {
    this.fieldId = fields.reduce((max, field) => {
      const match = /-(\d+)$/.exec(field.id);
      const idNumber = match ? Number.parseInt(match[1], 10) : 0;

      return Number.isFinite(idNumber) ? Math.max(max, idNumber) : max;
    }, 0);
  }

  private getDefaultValue(type: PdfBuilderFieldType, binding = ''): string {
    switch (type) {
      case 'variable':
        return this.getVariableToken(binding);
      case 'date':
        return '';
      case 'signature':
        return 'Signature';
      case 'initials':
        return 'Initials';
      case 'checkbox':
        return '';
      case 'stamp':
        return 'Reviewed';
      default:
        return '';
    }
  }

  private getDefaultBinding(type: PdfBuilderFieldType, id: string): string {
    if (type === 'text' || type === 'variable' || type === 'date') {
      return '';
    }

    return `document.${id}`;
  }

  private getVariableToken(binding = ''): string {
    return `{{${binding.trim() || 'variable'}}}`;
  }

  private getDefaultLabel(type: PdfBuilderFieldType, fallback?: string): string {
    return type === 'signature' ? 'Signature' : fallback ?? 'Field';
  }

  private commitFields(mutator: (fields: readonly PdfBuilderField[]) => readonly PdfBuilderField[]): void {
    this.undoStack.update(stack => [...stack.slice(-19), this.captureHistoryState()]);
    this.redoStack.set([]);
    this.fields.update(fields => mutator(fields));
  }

  private captureHistoryState(): PdfBuilderHistoryState {
    return {
      fields: this.fields().map(field => ({ ...field })),
      selectedFieldId: this.selectedFieldId(),
      activePage: this.activePage(),
    };
  }

  private restoreHistoryState(state: PdfBuilderHistoryState): void {
    this.fields.set(state.fields.map(field => ({ ...field })));
    this.selectedFieldId.set(state.selectedFieldId);
    this.editingFieldId.set(null);
    this.activePage.set(state.activePage);
  }

  private clearHistory(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  private recordActivity(title: string, detail: string, icon: string): void {
    this.activity.update(items => [{ title, detail, icon }, ...items].slice(0, 8));
  }

  private refreshViewerLayout(): void {
    const activePage = this.activePage();

    this.schedulePageGeometrySync();
    this.scheduleOverlayGeometrySync();
    this.document.defaultView?.setTimeout(() => this.scrollPageIntoView(activePage), 0);
  }

  private normalizePageRotation(rotation: unknown): PdfBuilderPageRotation {
    const value = typeof rotation === 'number' && Number.isFinite(rotation) ? rotation : 0;

    return (((value % 4) + 4) % 4) as PdfBuilderPageRotation;
  }

  private createVirtualPdfBlob(pageCount: number): Blob {
    const pageTotal = Math.max(1, Math.floor(pageCount));
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    ];
    const pageObjectIds = Array.from({ length: pageTotal }, (_, index) => 3 + index);

    objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageTotal} >>\nendobj\n`);

    for (const pageObjectId of pageObjectIds) {
      objects.push(`${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.276 841.89] /Resources << >> >>\nendobj\n`);
    }

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    for (const object of objects) {
      offsets.push(pdf.length);
      pdf += object;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';

    for (const offset of offsets.slice(1)) {
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private downloadCurrentPdf(): void {
    const source = this.documentSource();

    const defaultView = this.document.defaultView ?? window;
    let href: string | null = null;
    let revoke = false;

    if (typeof source === 'string') {
      href = source;
    } else {
      let blob: Blob;

      if (!source) {
        blob = this.createVirtualPdfBlob(this.pageCount());
      } else if (source instanceof Blob) {
        blob = source;
      } else if (source instanceof ArrayBuffer) {
        blob = new Blob([source], { type: 'application/pdf' });
      } else {
        const bytes = new Uint8Array(source);
        const copy = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(copy).set(bytes);
        blob = new Blob([copy], { type: 'application/pdf' });
      }

      href = defaultView.URL.createObjectURL(blob);
      revoke = true;
    }

    const anchor = this.document.createElement('a');
    anchor.href = href;
    anchor.download = this.documentName().endsWith('.pdf') ? this.documentName() : `${this.documentName()}.pdf`;
    this.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    if (revoke) {
      defaultView.setTimeout(() => defaultView.URL.revokeObjectURL(href), 0);
    }
  }
}
