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
  output,
  Renderer2,
  RendererStyleFlags2,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemLine,
  ListItemMeta,
  ListItemTitle,
} from '@ngstarter-ui/components/list';
import { NumberInput } from '@ngstarter-ui/components/number-input';
import {
  Panel,
  PanelAside,
  PanelContent,
  PanelHeader,
  PanelSidebar,
} from '@ngstarter-ui/components/panel';
import {
  PdfViewer,
  type PdfViewerLoadedEvent,
  type PdfViewerSource,
} from '@ngstarter-ui/components/pdf-viewer';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { SlideToggle, type SlideToggleChange } from '@ngstarter-ui/components/slide-toggle';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import {
  Toolbar,
  ToolbarItem,
  ToolbarSpacer,
  ToolbarSubtitle,
  ToolbarTitle,
} from '@ngstarter-ui/components/toolbar';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import {
  File as UploadFile,
  FileControl,
  UploadAllowedTypes,
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaIconDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadContainer,
  UploadFileSelectedEvent,
  UploadTriggerDirective,
} from '@ngstarter-ui/components/upload';
import {
  Tree,
  TreeNode,
  TreeNodeDef,
  TreeNodePadding,
} from '@ngstarter-ui/components/tree';

type PdfBuilderCanvasTool = 'select' | 'pan' | 'text';
type PdfBuilderFieldType = 'text' | 'variable' | 'signature' | 'initials' | 'checkbox' | 'stamp';
type PdfBuilderFieldSlot = 'primary' | 'signature' | 'initials' | 'checkbox' | 'comment' | 'footer' | 'side';

const PDF_BUILDER_PAGE_WIDTH = 595.276;
const PDF_BUILDER_PAGE_HEIGHT = 841.89;

interface PdfBuilderTool {
  readonly type: PdfBuilderFieldType;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

interface PdfBuilderLayerNode {
  id: string;
  label: string;
  icon: string;
  meta?: string;
  children?: PdfBuilderLayerNode[];
}

interface PdfBuilderPage {
  readonly page: number;
  readonly label: string;
}

interface PdfBuilderField {
  readonly id: string;
  readonly type: PdfBuilderFieldType;
  readonly page: number;
  readonly label: string;
  readonly binding: string;
  readonly value: string;
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

interface PdfBuilderObject {
  readonly label: string;
  readonly type: string;
  readonly icon: string;
  readonly state: string;
}

interface PdfBuilderValidation {
  readonly label: string;
  readonly icon: string;
  readonly passed: boolean;
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
    Button,
    Card,
    CardContent,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Chip,
    ChipSet,
    FormField,
    FormsModule,
    Icon,
    IconButtonSuffix,
    Input,
    Label,
    List,
    ListItem,
    ListItemIcon,
    ListItemLine,
    ListItemMeta,
    ListItemTitle,
    NumberInput,
    Panel,
    PanelAside,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    PdfViewer,
    ProgressBar,
    ScrollbarArea,
    SlideToggle,
    Tab,
    TabGroup,
    Toolbar,
    ToolbarItem,
    ToolbarSpacer,
    ToolbarSubtitle,
    ToolbarTitle,
    Tooltip,
    Tree,
    TreeNode,
    TreeNodeDef,
    TreeNodePadding,
    UploadAllowedTypes,
    UploadArea,
    UploadAreaDropStateDirective,
    UploadAreaIconDirective,
    UploadAreaInvalidStateDirective,
    UploadAreaMainStateDirective,
    UploadContainer,
    FileControl,
    UploadFile,
    UploadTriggerDirective,
  ],
  templateUrl: './pdf-builder.html',
  styleUrl: './pdf-builder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-builder not-prose',
  },
})
export class PdfBuilder {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private fieldId = 0;
  private removePlacementListeners: (() => void) | null = null;
  private removeFieldDragListeners: (() => void) | null = null;
  private removeFieldResizeListeners: (() => void) | null = null;
  private zoomAnimationFrameId: number | null = null;
  private suppressFieldClickId: string | null = null;

  readonly createBlankPdf = output<void>();
  readonly pdfFileSelected = output<UploadFileSelectedEvent>();
  readonly exportPdf = output<void>();

  protected readonly layersTree = viewChild<Tree<PdfBuilderLayerNode>>('layersTree');
  protected readonly documentName = signal('MSA.pdf');
  protected readonly documentSource = signal<PdfViewerSource>('/assets/pdf-builder/sample-contract.pdf');
  protected readonly documentSizeLabel = signal('4.1 KB');
  protected readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';
  protected readonly sourcePageCount = signal(2);
  protected readonly addedPageCount = signal(0);
  protected readonly pageCount = computed(() => this.sourcePageCount() + this.addedPageCount());
  protected readonly activePage = signal(1);
  protected readonly pdfScale = signal(1.33);
  protected readonly targetPdfScale = signal(1.33);
  protected readonly zoomLabel = computed(() => `${Math.round(this.targetPdfScale() * 100)}%`);
  protected readonly activeCanvasTool = signal<PdfBuilderCanvasTool>('select');
  protected readonly selectedFieldId = signal<string | null>(null);
  protected readonly placementGhost = signal<PdfBuilderPlacementGhost | null>(null);
  protected readonly fieldDrag = signal<PdfBuilderFieldDrag | null>(null);
  protected readonly fieldResize = signal<PdfBuilderFieldResize | null>(null);
  protected readonly pageStripVisible = signal(true);
  protected readonly libraryCollapsed = signal(false);
  protected readonly inspectorCollapsed = signal(false);
  protected readonly expandedLayerNodeIds = signal<ReadonlySet<string>>(new Set(['page-1', 'page-2']));
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

  protected readonly fields = signal<readonly PdfBuilderField[]>([]);

  protected readonly pages = computed<readonly PdfBuilderPage[]>(() =>
    Array.from({ length: this.pageCount() }, (_, index) => {
      const page = index + 1;

      return {
        page,
        label: page === 1 ? 'Cover' : page === this.pageCount() ? 'Signatures' : `Page ${page}`,
      };
    }),
  );

  protected readonly activePageFields = computed(() =>
    this.fields().filter(field => field.page === this.activePage()),
  );

  protected readonly fieldCount = computed(() => this.fields().length);
  protected readonly canUndo = computed(() => this.undoStack().length > 0);
  protected readonly canRedo = computed(() => this.redoStack().length > 0);
  protected readonly selectedField = computed(() =>
    this.fields().find(field => field.id === this.selectedFieldId()) ?? null,
  );
  protected readonly selectedFieldTitle = computed(() => this.selectedField()?.label ?? 'No field selected');
  protected readonly selectedFieldSubtitle = computed(() =>
    this.selectedField() ? 'Selected field' : 'Inspector',
  );
  protected readonly passedValidationCount = computed(() =>
    this.validations().filter(validation => validation.passed).length,
  );
  protected readonly preflightProgress = computed(() => {
    const validations = this.validations();

    if (!validations.length) {
      return 0;
    }

    return Math.round((this.passedValidationCount() / validations.length) * 100);
  });

  protected readonly layerTree = computed<PdfBuilderLayerNode[]>(() =>
    Array.from({ length: this.pageCount() }, (_, index) => {
      const page = index + 1;
      const pageFields = this.fields().filter(field => field.page === page);

      return {
        id: `page-${page}`,
        label: `Page ${page}`,
        icon: 'fluent:document-one-page-24-regular',
        meta: page === this.activePage() ? 'selected' : undefined,
        children: [
          {
            id: `page-${page}-pdf-layer`,
            label: 'Imported PDF layer',
            icon: 'fluent:layer-24-regular',
            meta: 'locked',
          },
          ...pageFields.map(field => ({
            id: field.id,
            label: field.label,
            icon: field.icon,
            meta: this.getLayerMeta(field),
          })),
        ],
      };
    }),
  );

  protected readonly selectedObjects = computed<readonly PdfBuilderObject[]>(() =>
    this.fields().map(field => ({
      label: field.label,
      type: this.getFieldTypeLabel(field.type),
      icon: field.icon,
      state: field.locked ? 'Locked' : field.required ? 'Required' : field.binding ? 'Data' : 'Draft',
    })),
  );

  protected readonly validations = computed<readonly PdfBuilderValidation[]>(() => [
    {
      label: this.documentSource() ? 'PDF loaded' : 'PDF missing',
      icon: this.documentSource() ? 'fluent:checkmark-circle-24-regular' : 'fluent:warning-24-regular',
      passed: !!this.documentSource(),
    },
    {
      label: `${this.fieldCount()} fields placed`,
      icon: 'fluent:form-24-regular',
      passed: this.fieldCount() > 0,
    },
    {
      label: 'Bindings mapped',
      icon: 'fluent:database-link-24-regular',
      passed: this.fields().every(field => field.type === 'text' || field.binding.trim().length > 0),
    },
    {
      label: 'Required fields ready',
      icon: 'fluent:signature-24-regular',
      passed: this.fields().some(field => field.required),
    },
  ]);

  protected readonly activity = signal<readonly PdfBuilderActivity[]>([
    {
      title: 'PDF imported',
      detail: 'MSA.pdf loaded with 2 editable pages.',
      icon: 'fluent:document-pdf-24-regular',
    },
    {
      title: 'Field mapped',
      detail: 'Counterparty variable bound to deal.legalName.',
      icon: 'fluent:database-link-24-regular',
    },
  ]);

  protected readonly layerChildrenAccessor = (node: PdfBuilderLayerNode) => node.children ?? [];
  protected readonly layerTrackBy = (_index: number, node: PdfBuilderLayerNode) => node.id;
  protected readonly hasLayerChildren = (_index: number, node: PdfBuilderLayerNode) =>
    !!node.children?.length;

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
      this.cancelZoomAnimation();
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

      this.scheduleOverlayGeometrySync();
    });

    effect(() => {
      this.placementGhost();
      this.pdfScale();

      this.schedulePlacementGhostGeometrySync();
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
    if (index === 2) {
      setTimeout(() => this.restoreLayerTreeExpansion());
    }
  }

  protected onFileSelected(event: UploadFileSelectedEvent): void {
    const [file] = event.files;

    if (file) {
      this.clearHistory();
      this.documentSource.set(file);
      this.documentName.set(file.name);
      this.documentSizeLabel.set(this.formatFileSize(file.size));
      this.sourcePageCount.set(0);
      this.addedPageCount.set(0);
      this.activePage.set(1);
      this.selectedFieldId.set(null);
      this.fields.set([]);
      this.recordActivity('PDF uploaded', `${file.name} opened for field placement.`, 'fluent:arrow-upload-24-regular');
    }

    this.pdfFileSelected.emit(event);
  }

  protected onPdfLoaded(event: PdfViewerLoadedEvent): void {
    const sourcePageCount = Math.max(0, event.pageCount);
    const pageCount = sourcePageCount + this.addedPageCount();

    this.sourcePageCount.set(sourcePageCount);
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

  protected isSourcePdfPage(pageNumber: number): boolean {
    return !!this.documentSource() && pageNumber <= this.sourcePageCount();
  }

  protected onViewerScroll(): void {
    const scrollElement = this.getViewerScrollElement();
    const pageShells = this.getPageShellElements();

    if (!scrollElement || !pageShells.length) {
      return;
    }

    const scrollRect = scrollElement.getBoundingClientRect();
    const anchorTop = scrollRect.top + Math.min(160, scrollRect.height * 0.28);
    let nearestPage = this.activePage();
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const pageShell of pageShells) {
      const page = this.getPageNumberFromShell(pageShell);

      if (!page) {
        continue;
      }

      const rect = pageShell.getBoundingClientRect();
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

  protected selectLayerNode(node: PdfBuilderLayerNode): void {
    if (node.id.includes('pdf-layer')) {
      this.selectedFieldId.set(null);
      return;
    }

    const pageMatch = /^page-(\d+)$/.exec(node.id);

    if (pageMatch) {
      this.selectPage(Number(pageMatch[1]));
      return;
    }

    const field = this.fields().find(item => item.id === node.id);

    if (field) {
      this.selectPage(field.page);
      this.selectedFieldId.set(field.id);
    }
  }

  protected selectField(fieldId: string, event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.suppressFieldClickId === fieldId) {
      this.suppressFieldClickId = null;
      return;
    }

    this.selectedFieldId.set(fieldId);
    this.activeCanvasTool.set('select');
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
    return field.type === 'text' || field.type === 'stamp' || field.type === 'signature' || field.type === 'initials';
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
    this.activeCanvasTool.set('select');
    this.activePage.set(field.page);
    this.selectedFieldId.set(field.id);
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
  }

  protected addField(type: PdfBuilderFieldType): void {
    if (!this.documentSource() || this.pageCount() === 0) {
      this.createBlankPdfDocument();
    }

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

    if (!this.documentSource() || this.pageCount() === 0) {
      this.createBlankPdfDocument();
    }

    const metrics = this.getDefaultMetricsForType(type);
    const tool = this.tools().find(item => item.type === type);
    const pagePoint = this.getPdfPointFromClient(event.clientX, event.clientY);

    this.selectedFieldId.set(null);
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
      pageX: pagePoint?.x ?? null,
      pageY: pagePoint?.y ?? null,
    });
    this.addPlacementEventListeners();
  }

  protected zoomIn(): void {
    this.setPdfScaleTarget(this.targetPdfScale() + 0.1);
  }

  protected zoomOut(): void {
    this.setPdfScaleTarget(this.targetPdfScale() - 0.1);
  }

  protected fitPage(): void {
    this.setPdfScaleTarget(1.33);
  }

  protected togglePageStrip(): void {
    this.pageStripVisible.update(visible => !visible);
  }

  protected toggleLibraryCollapsed(): void {
    this.libraryCollapsed.update(collapsed => !collapsed);
  }

  protected toggleInspectorCollapsed(): void {
    this.inspectorCollapsed.update(collapsed => !collapsed);
  }

  protected createBlankPdfDocument(): void {
    this.clearHistory();
    this.documentSource.set(this.createBlankPdfBlob());
    this.documentName.set('Blank contract.pdf');
    this.documentSizeLabel.set('1.0 KB');
    this.sourcePageCount.set(1);
    this.addedPageCount.set(0);
    this.activePage.set(1);
    this.selectedFieldId.set(null);
    this.fields.set([]);
    this.recordActivity('Blank PDF created', 'A one-page PDF is ready for fields.', 'fluent:document-add-24-regular');
    this.createBlankPdf.emit();
    setTimeout(() => this.restoreLayerTreeExpansion());
  }

  protected removePdf(): void {
    this.clearHistory();
    this.documentSource.set(null);
    this.documentName.set('No PDF loaded');
    this.documentSizeLabel.set('0 KB');
    this.sourcePageCount.set(0);
    this.addedPageCount.set(0);
    this.activePage.set(1);
    this.selectedFieldId.set(null);
    this.fields.set([]);
    this.recordActivity('PDF removed', 'The canvas is ready for a new PDF.', 'fluent:dismiss-24-regular');
  }

  protected addBlankPage(): void {
    if (!this.documentSource() && this.pageCount() === 0) {
      this.createBlankPdfDocument();
      return;
    }

    const nextPage = this.pageCount() + 1;

    this.addedPageCount.update(count => count + 1);
    this.activePage.set(nextPage);
    this.selectedFieldId.set(null);
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
    this.recordActivity('Field duplicated', `${duplicate.label} created.`, duplicate.icon);
  }

  protected deleteSelectedField(): void {
    const field = this.selectedField();

    if (!field || field.locked) {
      return;
    }

    this.commitFields(fields => fields.filter(item => item.id !== field.id));
    this.selectedFieldId.set(null);
    this.recordActivity('Field deleted', `${field.label} removed from Page ${field.page}.`, 'fluent:delete-24-regular');
  }

  protected toggleSelectedFieldLock(): void {
    const field = this.selectedField();

    if (!field) {
      return;
    }

    this.updateSelectedField('locked', !field.locked);
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

  protected updateSelectedFieldNumber(
    key: 'x' | 'y' | 'width' | 'height',
    value: number | undefined,
  ): void {
    this.updateSelectedField(key, Math.max(0, Math.round(value ?? 0)) as PdfBuilderField[typeof key]);
  }

  protected updateSelectedFieldRequired(event: SlideToggleChange): void {
    this.updateSelectedField('required', event.checked);
  }

  protected updateSelectedFieldReadonly(event: SlideToggleChange): void {
    this.updateSelectedField('readonly', event.checked);
  }

  protected exportCurrentPdf(): void {
    this.downloadCurrentPdf();
    this.recordActivity('PDF exported', `${this.documentName()} downloaded.`, 'fluent:document-pdf-24-regular');
    this.exportPdf.emit();
  }

  protected getFieldTypeLabel(type: PdfBuilderFieldType): string {
    switch (type) {
      case 'variable':
        return 'Variable text';
      case 'signature':
        return 'Signer input';
      case 'initials':
        return 'Initials';
      case 'checkbox':
        return 'Choice';
      case 'stamp':
        return 'Stamp';
      default:
        return 'Text';
    }
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

  private flattenLayerTree(nodes: readonly PdfBuilderLayerNode[]): PdfBuilderLayerNode[] {
    return nodes.flatMap(node => [node, ...this.flattenLayerTree(node.children ?? [])]);
  }

  private getLayerMeta(field: PdfBuilderField): string | undefined {
    if (field.id === this.selectedFieldId()) {
      return 'selected';
    }

    if (field.locked) {
      return 'locked';
    }

    if (field.required) {
      return 'required';
    }

    return undefined;
  }

  private movePlacementGhost(event: PointerEvent): void {
    const ghost = this.placementGhost();

    if (!ghost) {
      return;
    }

    event.preventDefault();

    const pagePoint = this.getPdfPointFromClient(event.clientX, event.clientY);

    this.placementGhost.set({
      ...ghost,
      clientX: event.clientX,
      clientY: event.clientY,
      overPage: !!pagePoint,
      page: pagePoint?.page ?? null,
      pageX: pagePoint?.x ?? null,
      pageY: pagePoint?.y ?? null,
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

    const pagePoint = this.getPdfPointFromClient(event.clientX, event.clientY);

    this.removePlacementEventListeners();
    this.placementGhost.set(null);

    if (!pagePoint) {
      return;
    }

    const field = this.createField(ghost.type, {
      page: pagePoint.page,
      slot: this.getDefaultSlotForType(ghost.type),
      ...this.getCenteredFieldMetrics(ghost.type, pagePoint.x, pagePoint.y),
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
    const x = Math.round(this.clamp(drag.startX + deltaX, 0, maxX));
    const y = Math.round(this.clamp(drag.startY + deltaY, 0, maxY));
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
    this.selectedFieldId.set(drag.fieldId);
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
    const minimumMetrics = this.getDefaultMetricsForType(currentField.type);
    const deltaX = (event.clientX - resize.originClientX) / scale.x;
    const deltaY = (event.clientY - resize.originClientY) / scale.y;
    const maxWidth = Math.max(minimumMetrics.width, PDF_BUILDER_PAGE_WIDTH - resize.startX);
    const maxHeight = Math.max(minimumMetrics.height, PDF_BUILDER_PAGE_HEIGHT - resize.startY);
    const width = Math.round(this.clamp(resize.startWidth + deltaX, minimumMetrics.width, maxWidth));
    const height = Math.round(this.clamp(resize.startHeight + deltaY, minimumMetrics.height, maxHeight));
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
    this.selectedFieldId.set(resize.fieldId);
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
      const rect = pageShell.getBoundingClientRect();

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

  private getCenteredFieldMetrics(
    type: PdfBuilderFieldType,
    centerX: number,
    centerY: number,
  ): Pick<PdfBuilderField, 'x' | 'y' | 'width' | 'height'> {
    const metrics = this.getDefaultMetricsForType(type);
    const width = Math.min(metrics.width, PDF_BUILDER_PAGE_WIDTH);
    const height = Math.min(metrics.height, PDF_BUILDER_PAGE_HEIGHT);

    return {
      x: Math.round(this.clamp(centerX - width / 2, 0, PDF_BUILDER_PAGE_WIDTH - width)),
      y: Math.round(this.clamp(centerY - height / 2, 0, PDF_BUILDER_PAGE_HEIGHT - height)),
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
      const fieldId = element.dataset['fieldId'];
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

    this.syncSelectionToolbarGeometry();
  }

  private syncSelectionToolbarGeometry(): void {
    const field = this.selectedField();
    const toolbar = this.getSelectionToolbarElement();

    if (this.fieldDrag() || !field || !toolbar) {
      return;
    }

    const pageShell = this.getPageShellElement(field.page);

    if (!pageShell) {
      return;
    }

    const scale = this.getRenderedPageScale(field.page);
    const pageRect = pageShell.getBoundingClientRect();
    const toolbarWidth = toolbar.offsetWidth;
    const toolbarHeight = toolbar.offsetHeight;
    const gap = 10;
    const inset = 8;
    const fieldLeft = field.x * scale.x;
    const fieldTop = field.y * scale.y;
    const fieldWidth = field.width * scale.x;
    const fieldHeight = field.height * scale.y;
    const centeredLeft = fieldLeft + fieldWidth / 2;
    const minLeft = toolbarWidth / 2 + inset;
    const maxLeft = Math.max(minLeft, pageRect.width - toolbarWidth / 2 - inset);
    const aboveTop = fieldTop - toolbarHeight - gap;
    const belowTop = fieldTop + fieldHeight + gap;
    const top = aboveTop >= inset ? aboveTop : Math.min(belowTop, pageRect.height - toolbarHeight - inset);

    this.setCssVar(toolbar, '--pdf-builder-toolbar-left', `${this.clamp(centeredLeft, minLeft, maxLeft)}px`);
    this.setCssVar(toolbar, '--pdf-builder-toolbar-top', `${Math.max(inset, top)}px`);
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

    const scale = this.getRenderedPageScale(ghost.page ?? this.activePage());

    this.setCssVar(element, '--pdf-builder-ghost-left', `${ghost.clientX}px`);
    this.setCssVar(element, '--pdf-builder-ghost-top', `${ghost.clientY}px`);
    this.setCssVar(element, '--pdf-builder-ghost-width', `${ghost.width * scale.x}px`);
    this.setCssVar(element, '--pdf-builder-ghost-height', `${ghost.height * scale.y}px`);
  }

  private getRenderedPageScale(pageNumber = this.activePage()): { x: number; y: number } {
    const pageShell = this.getPageShellElement(pageNumber);

    if (!pageShell) {
      const scale = this.pdfScale();
      return { x: scale, y: scale };
    }

    const rect = pageShell.getBoundingClientRect();

    return {
      x: rect.width / PDF_BUILDER_PAGE_WIDTH,
      y: rect.height / PDF_BUILDER_PAGE_HEIGHT,
    };
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

  private setPdfScaleTarget(scale: number): void {
    const nextScale = this.clamp(Number(scale.toFixed(2)), 0.7, 2);

    this.targetPdfScale.set(nextScale);
    this.animatePdfScale(nextScale);
  }

  private animatePdfScale(targetScale: number): void {
    const defaultView = this.document.defaultView;
    const startScale = this.pdfScale();

    this.cancelZoomAnimation();

    if (!defaultView || Math.abs(startScale - targetScale) < 0.0001) {
      this.pdfScale.set(targetScale);
      return;
    }

    const duration = 180;
    let startedAt: number | null = null;

    const tick = (timestamp: number): void => {
      startedAt ??= timestamp;

      const progress = this.clamp((timestamp - startedAt) / duration, 0, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextScale = startScale + (targetScale - startScale) * easedProgress;

      this.pdfScale.set(Number(nextScale.toFixed(4)));

      if (progress < 1 && this.targetPdfScale() === targetScale) {
        this.zoomAnimationFrameId = defaultView.requestAnimationFrame(tick);
        return;
      }

      this.zoomAnimationFrameId = null;
      this.pdfScale.set(this.targetPdfScale());
    };

    this.zoomAnimationFrameId = defaultView.requestAnimationFrame(tick);
  }

  private cancelZoomAnimation(): void {
    const defaultView = this.document.defaultView;

    if (defaultView && this.zoomAnimationFrameId !== null) {
      defaultView.cancelAnimationFrame(this.zoomAnimationFrameId);
    }

    this.zoomAnimationFrameId = null;
  }

  private scheduleDomSync(callback: () => void): void {
    const defaultView = this.document.defaultView;

    if (!defaultView) {
      callback();
      return;
    }

    defaultView.requestAnimationFrame(callback);
  }

  private getPageShellElement(pageNumber = this.activePage()): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(`.pdf-page-shell[data-page-number="${pageNumber}"]`);
  }

  private getPageShellElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.pdf-page-shell'));
  }

  private getPageNumberFromShell(pageShell: HTMLElement): number | null {
    const value = Number(pageShell.dataset['pageNumber']);
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

  private getOverlayFieldElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-field-id]'));
  }

  private getPlacementGhostElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.placement-ghost');
  }

  private getSelectionToolbarElement(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>('.selection-toolbar');
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

  private createField(
    type: PdfBuilderFieldType,
    placement?: Partial<Pick<PdfBuilderField, 'page' | 'slot' | 'x' | 'y' | 'width' | 'height'>>,
  ): PdfBuilderField {
    const tool = this.tools().find(item => item.type === type);
    const slot = placement?.slot ?? this.nextSlot();
    const id = this.nextFieldId(type);

    return {
      id,
      type,
      page: placement?.page ?? this.activePage(),
      label: this.getDefaultLabel(type, tool?.label),
      binding: type === 'text' ? '' : `document.${id}`,
      value: this.getDefaultValue(type),
      icon: tool?.icon ?? 'fluent:form-24-regular',
      slot,
      ...this.getSlotMetrics(slot),
      ...placement,
      required: type === 'signature' || type === 'initials',
      readonly: type === 'stamp',
      locked: false,
    };
  }

  private nextFieldId(type: PdfBuilderFieldType): string {
    this.fieldId += 1;
    return `field-${type}-${this.fieldId}`;
  }

  private nextSlot(): PdfBuilderFieldSlot {
    const slots: PdfBuilderFieldSlot[] = ['primary', 'checkbox', 'signature', 'initials', 'footer', 'side', 'comment'];
    return slots[this.fields().length % slots.length];
  }

  private getSlotMetrics(slot: PdfBuilderFieldSlot): Pick<PdfBuilderField, 'x' | 'y' | 'width' | 'height'> {
    switch (slot) {
      case 'signature':
        return { x: 384, y: 711, width: 154, height: 42 };
      case 'initials':
        return { x: 384, y: 612, width: 105, height: 42 };
      case 'checkbox':
        return { x: 453, y: 282, width: 76, height: 21 };
      case 'comment':
        return { x: 96, y: 160, width: 120, height: 96 };
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

  private getDefaultSlotForType(type: PdfBuilderFieldType): PdfBuilderFieldSlot {
    switch (type) {
      case 'signature':
        return 'signature';
      case 'initials':
        return 'initials';
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

  private getDefaultValue(type: PdfBuilderFieldType): string {
    switch (type) {
      case 'variable':
        return '{{variable.value}}';
      case 'signature':
        return 'Signature';
      case 'initials':
        return 'Initials';
      case 'checkbox':
        return 'Checkbox';
      case 'stamp':
        return 'Reviewed';
      default:
        return 'Enter value';
    }
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
    this.activePage.set(state.activePage);
  }

  private clearHistory(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  private recordActivity(title: string, detail: string, icon: string): void {
    this.activity.update(items => [{ title, detail, icon }, ...items].slice(0, 8));
  }

  private createBlankPdfBlob(): Blob {
    const content = 'BT /F1 18 Tf 72 760 Td (Blank contract PDF) Tj ET';
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.276 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
      `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    ];
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

    if (!source) {
      return;
    }

    const defaultView = this.document.defaultView ?? window;
    let href: string | null = null;
    let revoke = false;

    if (typeof source === 'string') {
      href = source;
    } else {
      let blob: Blob;

      if (source instanceof Blob) {
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

  private formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
}
