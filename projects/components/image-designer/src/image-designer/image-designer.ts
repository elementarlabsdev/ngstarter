import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
  effect,
  PLATFORM_ID, OnInit, forwardRef, output, booleanAttribute, untracked,
  DestroyRef, numberAttribute
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { debounceTime, isObservable, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Panel, PanelContent, PanelHeader, PanelSidebar } from '@ngstarter/components/panel';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';
import { Button } from '@ngstarter/components/button';
import { Divider } from '@ngstarter/components/divider';
import { Icon } from '@ngstarter/components/icon';
import {
  TabPanel,
  TabPanelAside,
  TabPanelAsideContentDirective,
  TabPanelContent,
  TabPanelItem, TabPanelItemIconDirective, TabPanelItemText, TabPanelNav
} from '@ngstarter/components/tab-panel';
import {
  UploadFileSelectedEvent,
  UploadTriggerDirective
} from '@ngstarter/components/upload';
import { List, ListItem, ListItemLine } from '@ngstarter/components/list';
import { ProgressSpinner } from '@ngstarter/components/spinner';
import { ImageDesignerService } from '../image-designer.service';
import {
  ElementConfig,
  LayerConfig,
  PhotosDataSource,
  ImageDesignerPhoto,
  AssetsDataSource,
  ImagePresetCategory,
  ImageSize,
  ImageDesignerUploadFn,
  ImageDesignerSnapshot
} from '../types';
import { createDefaultPhotosDataSource } from '../default-photos-data-source';
import { FormsModule } from '@angular/forms';
import { Tab, TabGroup } from '@ngstarter/components/tabs';
import { ColorSwitcher } from '@ngstarter/components/color-switcher';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle
} from '@ngstarter/components/expansion';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Option, Select } from '@ngstarter/components/select';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { SVG_PATTERNS } from '../patterns';
import { SVG_ELEMENTS } from '../elements';
import { PRESET_CATEGORIES } from '../presets';
import { CdkPortalOutlet, ComponentPortal, Portal } from '@angular/cdk/portal';
import { IMAGE_DESIGNER } from '../tokens';
import { Settings } from '../settings/settings';
import { Effects } from '../effects/effects';

@Component({
  selector: 'ngs-image-designer',
  exportAs: 'ngsImageDesigner',
  imports: [
    Panel,
    PanelSidebar,
    PanelContent,
    PanelHeader,
    Toolbar,
    Button,
    ToolbarSpacer,
    Divider,
    Icon,
    ToolbarTitle,
    TabPanel,
    TabPanelAside,
    TabPanelAsideContentDirective,
    TabPanelContent,
    TabPanelItem,
    TabPanelItemIconDirective,
    TabPanelItemText,
    TabPanelNav,
    List,
    ListItem,
    ListItemLine,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    TabGroup,
    Tab,
    Accordion,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    FormField,
    Label,
    Input,
    Select,
    Option,
    ColorSwitcher,
    ScrollbarArea,
    CdkPortalOutlet,
    UploadTriggerDirective,
    ProgressSpinner,
    FormsModule,
  ],
  providers: [
    ImageDesignerService,
    {
      provide: IMAGE_DESIGNER,
      useExisting: forwardRef(() => ImageDesigner)
    }
  ],
  templateUrl: './image-designer.html',
  styleUrl: './image-designer.scss',
  host: {
    'class': 'ngs-image-designer',
    '(keydown)': 'onKeyDown($event)'
  }
})
export class ImageDesigner implements AfterViewInit, OnDestroy, OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  designerService = inject(ImageDesignerService);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  title = input('');
  imageSize = input({
    width: 700,
    height: 400
  });
  defaultFont = input<string>('Inter');
  scale = input(1);
  minScale = input(0.1);
  maxScale = input(3);
  showGuidelines = input(true);
  snapToShapes = input(true);
  snapToStageCenter = input(true);
  snapToStageBorders = input(true);
  guidelineColor = input('blue');
  snapRange = input(5);
  showDownloadButton = input(true, {
    transform: booleanAttribute
  });
  uploadFn = input<ImageDesignerUploadFn>();
  snapshot = input<ImageDesignerSnapshot>();
  snapshotChanged = output<ImageDesignerSnapshot>();
  photosDataSource = input<PhotosDataSource>();
  assetsDataSource = input<AssetsDataSource>();
  historyLimit = input(50, {
    transform: numberAttribute
  });

  activeItemId = signal<string | null>('text');
  elements = signal<ElementConfig[]>(SVG_ELEMENTS);
  photos = signal<ImageDesignerPhoto[]>([]);
  assets = signal<ImageDesignerPhoto[]>([]);
  photosFilter = signal('');
  assetsFilter = signal('');
  uploadedImages = signal<ImageDesignerPhoto[]>([]);
  isUploading = signal(false);
  uploadPreview = signal<string | null>(null);
  photosPage = signal(1);
  assetsPage = signal(1);
  isLoadingPhotos = signal(false);
  isLoadingAssets = signal(false);
  hasMoreAssets = signal(true);
  hasMorePhotos = signal(true);

  resizeWidth = signal(0);
  resizeHeight = signal(0);
  resizeUnit = signal('px');
  presetCategories = signal<ImagePresetCategory[]>(PRESET_CATEGORIES);

  presetColors = signal<string[]>([
    // Basic & Neutral
    '#000000', '#7a7a7a', '#ffffff',
    // Reds & Pinks
    '#f44336', '#d32f2f', '#ff5252',
    '#e91e63', '#c2185b', '#ff4081',
    // Purples & Deep Purples
    '#9c27b0', '#7b1fa2', '#e040fb',
    '#673ab7', '#512da8', '#7c4dff',
    // Blues
    '#3f51b5', '#303f9f', '#536dfe',
    '#2196f3', '#1976d2', '#448aff',
    '#03a9f4', '#0288d1', '#40c4ff',
    // Teals & Cyans
    '#00bcd4', '#0097a7', '#18ffff',
    '#009688', '#00796b', '#64ffda',
    // Greens
    '#4caf50', '#388e3c', '#00c853',
    '#8bc34a', '#689f38', '#b2ff59',
    '#cddc39', '#afb42b', '#eeff41',
    // Yellows & Oranges
    '#ffeb3b', '#fbc02d', '#ffff00',
    '#ffc107', '#ffa000', '#ffc400',
    '#ff9800', '#f57c00', '#ff9100',
    '#ff5722', '#e64a19', '#ff3d00',
    // Browns
    '#795548', '#5d4037', '#8d6e63',
    // Blue Grays & Grays
    '#607d8b', '#455a64', '#78909c',
  ]);
  background = signal([]);
  resize = signal([]);


  displayScale = this.designerService.scale;
  zoomPercentage = computed(() => (this.displayScale() * 100).toFixed(0));

  layersFromService = this.designerService.layers;
  selectedLayerId = this.designerService.selectedLayerId;

  presetPatterns = signal([
    ...SVG_PATTERNS.map(svg => `data:image/svg+xml;base64,${btoa(svg)}`),
  ]);

  presetGradients = computed(() => {
    const width = this.resizeWidth();
    const height = this.resizeHeight();
    const isLandscape = width >= height;

    const baseColors = [
      // --- VIBRANT & ENERGETIC ---
      ['#ff9a9e', '#fecfef'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f8d4'], ['#fa709a', '#fee140'], ['#30cfd0', '#330867'],
      ['#ff0844', '#ffb199'], ['#ff8177', '#ff867a'], ['#f83600', '#f9d423'],
      ['#b721ff', '#21d4fd'], ['#00dbde', '#fc00ff'], ['#8ec5fc', '#e0c3fc'],
      ['#6a11cb', '#2575fc'], ['#09203f', '#537895'], ['#00c6fb', '#005bea'],
      ['#ffecd2', '#fcb69f'], ['#ff758c', '#ff7eb3'], ['#868f96', '#596164'],
      ['#0ba360', '#3cba92'], ['#13547a', '#80d0c7'], ['#6a85b6', '#bac8e0'],
      ['#434343', '#000000'], ['#92fe9d', '#00c9ff'], ['#f40076', '#df98fa'],
      ['#f067b4', '#81ffef'], ['#ff4b1f', '#ff9068'], ['#16a085', '#f4d03f'],
      ['#00d2ff', '#3a7bd5'], ['#f7971e', '#ffd200'], ['#f12711', '#f5af19'],
      ['#12c2e9', '#c471ed'], ['#f64f59', '#12c2e9'], ['#74ebd5', '#acb6e5'],
      ['#ff9966', '#ff5e62'], ['#00b09b', '#96c93d'], ['#654ea3', '#eaafc8'],
      ['#4e54c8', '#8f94fb'], ['#ff0099', '#493240'], ['#8e2de2', '#4a00e0'],
      ['#3a1c71', '#d76d77'], ['#1f4037', '#99f2c8'], ['#56ab2f', '#a8e063'],
      ['#f11712', '#0099f7'], ['#11998e', '#38ef7d'], ['#fc466b', '#3f5efb'],
      ['#c94b4b', '#4b134f'], ['#00b4db', '#0083b0'], ['#7b4397', '#dc2430'],
      ['#1e3c72', '#2a5298'], ['#2c3e50', '#fd746c'], ['#f00000', '#dc281e'],
      ['#ff512f', '#dd2476'], ['#ff5f6d', '#ffc371'], ['#114357', '#f29492'],
      ['#40e0d0', '#ff8c00'], ['#ff0080', '#ff8c00'], ['#000046', '#1cb5e0'],
      ['#642b73', '#c6426e'], ['#cb2d3e', '#ef473a'], ['#5614b0', '#dbd65d'],
      ['#00c3ff', '#ffff1c'], ['#1d2b64', '#f8cdda'], ['#1a2a6c', '#b21f1f'],
      ['#cc2b5e', '#753a88'], ['#2193b0', '#6dd5ed'], ['#ee9ca7', '#ffdde1'],
      ['#e65100', '#fdb813'], ['#360033', '#0b8793'], ['#141e30', '#243b55'],
      ['#2c3e50', '#4ca1af'], ['#ff512f', '#f06292'], ['#70e1f5', '#ffd194'],
      ['#1c92d2', '#f2fcfe'], ['#3ca55c', '#b5ac49'], ['#4b6cb7', '#182848'],
      ['#00bf8f', '#001510'], ['#517fa4', '#243949'], ['#1e130c', '#9a8478'],
      ['#000000', '#533440'], ['#304352', '#d7d2cc'], ['#83a4d4', '#b6fbff'],
      ['#4568dc', '#b06ab3'], ['#ef3b36', '#ffffff'], ['#000000', '#434343'],
      ['#0f2027', '#203a43'], ['#373b44', '#4286f4'], ['#8e9eab', '#eef2f3']
    ];

    return baseColors.map(([c1, c2]) => ({
      x0: 0,
      y0: 0,
      x1: isLandscape ? width : 0,
      y1: isLandscape ? 0 : height,
      colorStops: [0, c1, 1, c2],
      css: `linear-gradient(${isLandscape ? '90deg' : '180deg'}, ${c1}, ${c2})`
    }));
  });

  settingsPortal = signal<Portal<any> | null>(null);
  effectsPortal = signal<Portal<any> | null>(null);

  openEffects() {
    this.effectsPortal.set(new ComponentPortal(Effects));
  }

  constructor() {
    this.resizeWidth.set(this.imageSize().width);
    this.resizeHeight.set(this.imageSize().height);

    effect(() => {
      const size = this.imageSize();
      untracked(() => {
        this.resizeWidth.set(size.width);
        this.resizeHeight.set(size.height);
      });
    });

    this.designerService.change$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.snapshotChanged.emit(this.designerService.getSnapshot());
    });

    effect(() => {
      this.designerService.setScale(this.scale());
    });
    effect(() => {
      this.designerService.setMinMaxScale(this.minScale(), this.maxScale());
    });
    effect(() => {
      this.designerService.updateSnapSettings({
        showGuidelines: this.showGuidelines(),
        snapToShapes: this.snapToShapes(),
        snapToStageCenter: this.snapToStageCenter(),
        snapToStageBorders: this.snapToStageBorders(),
        guidelineColor: this.guidelineColor(),
        snapRange: this.snapRange()
      });
    });

    effect(() => {
      const selectedId = this.selectedLayerId();
      if (selectedId) {
        this.settingsPortal.set(new ComponentPortal(Settings));
      } else {
        this.settingsPortal.set(null);
        this.effectsPortal.set(null);
      }
    });

    effect(() => {
      if (this.activeItemId() === 'photos' && this.photos().length === 0 && !this.isLoadingPhotos() && this.hasMorePhotos()) {
        this.loadPhotos();
      }
    });

    effect(() => {
      if ((this.activeItemId() === 'assets' || this.activeItemId() === 'upload') && this.assets().length === 0 && !this.isLoadingAssets() && this.hasMoreAssets()) {
        this.loadAssets();
      }
    });

    effect(() => {
      this.photosFilter();
      untracked(() => {
        if (this.activeItemId() === 'photos') {
          this.photos.set([]);
          this.photosPage.set(1);
          this.hasMorePhotos.set(true);
          this.loadPhotos();
        }
      });
    });

    effect(() => {
      this.assetsFilter();
      untracked(() => {
        if (this.activeItemId() === 'assets' || this.activeItemId() === 'upload') {
          this.assets.set([]);
          this.assetsPage.set(1);
          this.hasMoreAssets.set(true);
          this.loadAssets();
        }
      });
    });

    effect(() => {
      const snapshot = this.snapshot();

      if (snapshot && this.designerService.isInitialized()) {
        const nextVersion = snapshot.version ?? 0;
        const currentVersion = this.designerService.currentSnapshotVersion;

        if (nextVersion !== currentVersion) {
          console.log(`Snapshot version: ${nextVersion}, Designer version: ${currentVersion}`);
          console.log(`Snapshot version changed, loading new snapshot`);
          this.designerService.loadSnapshot(snapshot, true);
        }
      }
    });
  }

  ngOnInit() {
    this.designerService.historyLimit = this.historyLimit();
    if (this.assets().length > 0) {
      this.uploadedImages.set([...this.assets()]);
    }
  }

  onFileSelected(event: UploadFileSelectedEvent) {
    if (event.files.length > 0) {
      const file = event.files[0];
      const uploadFn = this.uploadFn();

      if (uploadFn) {
        const result = uploadFn(file);
        this.isUploading.set(true);

        const handleSuccess = async (result: any) => {
          let photo: ImageDesignerPhoto;
          if (typeof result === 'string') {
            const dimensions = await this.getImageDimensions(result);
            photo = {
              id: Math.random().toString(36).substring(7),
              url: result,
              width: dimensions.width,
              height: dimensions.height
            };
          } else {
            photo = result;
          }
          this.uploadedImages.update(images => [photo, ...images]);
          this.isUploading.set(false);
        };

        const handleError = () => {
          this.isUploading.set(false);
        };

        if (isObservable(result)) {
          result.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: handleSuccess,
            error: handleError
          });
        } else if (result instanceof Promise) {
          result.then(handleSuccess).catch(handleError);
        } else {
          handleSuccess(result);
        }
      } else {
        this.fakeUpload(file);
      }
    }
  }

  private fakeUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const url = e.target.result;
      const dimensions = await this.getImageDimensions(url);
      const photo: ImageDesignerPhoto = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        url: url,
        width: dimensions.width,
        height: dimensions.height
      };
      this.uploadedImages.update(images => [photo, ...images]);
    };
    reader.readAsDataURL(file);
  }

  private getImageDimensions(url: string): Promise<{ width: number, height: number }> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  }

  async addUploadedImage(photo: ImageDesignerPhoto, x = 0, y = 0) {
    const canvasWidth = this.resizeWidth();
    const canvasHeight = this.resizeHeight();
    const url = photo.url;

    let width = canvasWidth;
    let height = canvasWidth * (photo.height / photo.width);

    if (height > canvasHeight) {
      height = canvasHeight;
      width = height * (photo.width / photo.height);
    }

    const id = await this.designerService.addLayer({
      type: 'image',
      src: url,
      name: 'Uploaded Image',
      width,
      height,
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }


  loadAssets() {
    const dataSource = this.assetsDataSource();
    if (!dataSource || this.isLoadingAssets() || !this.hasMoreAssets()) {
      return;
    }

    this.isLoadingAssets.set(true);

    const pageSize = 30;
    const page = this.assetsPage();
    const startRow = (page - 1) * pageSize;
    const endRow = page * pageSize;

    dataSource.getItems({
      startRow,
      endRow,
      page,
      pageSize,
      filterModel: this.assetsFilter(),
      successCallback: (data: ImageDesignerPhoto[], lastRow?: number) => {
        this.assets.update(assets => [...assets, ...data]);
        if (data.length === 0) {
          this.hasMoreAssets.set(false);
        }
        this.isLoadingAssets.set(false);
      },
      failCallback: () => {
        this.isLoadingAssets.set(false);
      }
    });
  }

  onAssetsScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      if (!this.isLoadingAssets() && this.hasMoreAssets()) {
        this.assetsPage.update(p => p + 1);
        this.loadAssets();
      }
    }
  }


  loadPhotos() {
    if (this.isLoadingPhotos() || !this.hasMorePhotos()) return;
    this.isLoadingPhotos.set(true);

    const ds = this.photosDataSource() || this.defaultPhotosDataSource;
    const page = this.photosPage();
    const pageSize = 30;

    ds.getItems({
      startRow: (page - 1) * pageSize,
      endRow: page * pageSize,
      page: page,
      pageSize: pageSize,
      filterModel: this.photosFilter(),
      successCallback: (data: ImageDesignerPhoto[], lastRow?: number) => {
        this.photos.update(photos => [...photos, ...data]);
        if (data.length === 0) {
          this.hasMorePhotos.set(false);
        }
        this.isLoadingPhotos.set(false);
      },
      failCallback: () => {
        this.isLoadingPhotos.set(false);
      }
    });
  }

  private readonly defaultPhotosDataSource = createDefaultPhotosDataSource(this.http);

  onPhotosScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target && target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      if (!this.isLoadingPhotos() && this.hasMorePhotos()) {
        this.photosPage.update(p => p + 1);
        this.loadPhotos();
      }
    }
  }

  async addImage(photo: ImageDesignerPhoto, x = 0, y = 0) {
    const canvasWidth = this.resizeWidth();
    const canvasHeight = this.resizeHeight();

    let width = canvasWidth;
    let height = canvasWidth * (photo.height / photo.width);

    if (height > canvasHeight) {
      height = canvasHeight;
      width = height * (photo.width / photo.height);
    }

    const id = await this.designerService.addLayer({
      type: 'image',
      src: photo.url,
      name: photo.name,
      width,
      height,
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }
    const container = this.canvasContainer()?.nativeElement;
    if (container) {
      console.log('Initializing ImageDesignerService in requestAnimationFrame');
      requestAnimationFrame(() => {
        if (!this.canvasContainer()) {
          console.warn('Canvas container disappeared before initialization');
          return;
        }
        const currentContainer = this.canvasContainer()!.nativeElement;

        // Final check before init, if dimensions are 0, wait a bit more
        if (currentContainer.offsetWidth === 0 || currentContainer.offsetHeight === 0) {
          console.warn('Container dimensions are still 0, retrying init');
          setTimeout(() => this.ngAfterViewInit(), 250);
          return;
        }

        console.log('Initializing ImageDesignerService with container:', currentContainer);
        console.log('Container dimensions in rAF:', currentContainer.offsetWidth, 'x', currentContainer.offsetHeight);
        this.designerService.init(
          currentContainer,
          this.imageSize(),
          this.defaultFont(),
          this.scale(),
          this.minScale(),
          this.maxScale()
        ).then(() => {
          console.log('ImageDesignerService initialization completed');
        });
      });
    } else {
      console.warn('Canvas container not found during ngAfterViewInit');
    }
  }

  ngOnDestroy() {
    this.designerService.destroy();
  }

  toggleAside() {
    this.activeItemId.set(this.activeItemId() ? null : 'text');
  }

  zoomIn() {
    this.designerService.zoomIn();
  }

  zoomOut() {
    this.designerService.zoomOut();
  }

  undo() {
    this.designerService.undo();
  }

  redo() {
    this.designerService.redo();
  }

  resetZoom() {
    this.designerService.setScale(1);
  }

  onWheel(event: WheelEvent) {
    if (event.metaKey || event.ctrlKey) {
      // preventDefault is not allowed during event replay (e.g. during hydration).
      // EventPhase.REPLAY is 101 in Angular.
      if ((event as any).eventPhase !== 101) {
        event.preventDefault();
      }
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    const isInput = activeElement instanceof HTMLInputElement ||
                    activeElement instanceof HTMLTextAreaElement ||
                    (activeElement instanceof HTMLElement && activeElement.isContentEditable);

    if (isInput) {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;

      if (event.key === 'ArrowLeft') {
        this.designerService.moveSelectedLayers(-step, 0);
      } else if (event.key === 'ArrowRight') {
        this.designerService.moveSelectedLayers(step, 0);
      } else if (event.key === 'ArrowUp') {
        this.designerService.moveSelectedLayers(0, -step);
      } else if (event.key === 'ArrowDown') {
        this.designerService.moveSelectedLayers(0, step);
      }
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.designerService.deleteSelectedLayers();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.redo();
    }
  }

  selectLayer(id: string | null | undefined) {
    this.designerService.selectLayer(id as string | null);
  }

  toggleLayerVisibility(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.designerService.toggleLayerVisibility(id);
  }

  toggleLayerLock(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.designerService.toggleLayerLock(id);
  }

  deleteLayer(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.designerService.deleteLayer(id);
  }

  onDragOver(event: DragEvent) {
    if (event.dataTransfer?.types.includes('application/x-ngs-text-type') ||
        event.dataTransfer?.types.includes('application/x-ngs-image-data')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onTextDragStart(event: DragEvent, type: string) {
    event.dataTransfer?.setData('application/x-ngs-text-type', type);

    if (event.target instanceof HTMLElement) {
      const el = event.target;
      el.classList.add('is-dragging');
      setTimeout(() => el.classList.remove('is-dragging'), 0);
    }
  }

  onImageDragStart(event: DragEvent, photo: ImageDesignerPhoto | ElementConfig) {
    const data = 'url' in photo
      ? { url: photo.url, name: photo.name, width: photo.width, height: photo.height, type: 'image' }
      : { url: photo.data, name: photo.name, width: 100, height: 100, type: 'shape' };

    event.dataTransfer?.setData('application/x-ngs-image-data', JSON.stringify(data));

    if (event.target instanceof HTMLElement) {
      const el = event.target;
      el.classList.add('is-dragging');
      setTimeout(() => el.classList.remove('is-dragging'), 0);
    }
  }

  onDrop(event: DragEvent) {
    const textType = event.dataTransfer?.getData('application/x-ngs-text-type');
    const imageDataStr = event.dataTransfer?.getData('application/x-ngs-image-data');

    if (!textType && !imageDataStr) return;

    event.preventDefault();

    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scale = this.designerService.scale();

    // Calculate position relative to the stage center
    const canvasRect = this.designerService['canvasRect'];
    if (!canvasRect) return;

    const centerX = canvasRect.x();
    const centerY = canvasRect.y();

    const x = (event.clientX - rect.left - centerX) / scale;
    const y = (event.clientY - rect.top - centerY) / scale;

    if (textType) {
      switch (textType) {
        case 'header':
          this.addHeader(x, y);
          break;
        case 'subheader':
          this.addSubheader(x, y);
          break;
        case 'body':
          this.addBodyText(x, y);
          break;
      }
    } else if (imageDataStr) {
      try {
        const data = JSON.parse(imageDataStr);
        if (data.type === 'image') {
          this.addImage({
            url: data.url,
            name: data.name,
            width: data.width,
            height: data.height,
            id: ''
          }, x, y);
        } else if (data.type === 'shape') {
          this.addShape({
            name: data.name,
            data: data.url
          }, x, y);
        }
      } catch (e) {
        console.error('Failed to parse image data', e);
      }
    }
  }

  drop(event: CdkDragDrop<LayerConfig[]>) {
    if (event.previousIndex !== event.currentIndex) {
      this.designerService.reorderLayers(event.previousIndex, event.currentIndex);
    }
  }

  download() {
    this.designerService.downloadImage();
  }

  getBase64Image(): string | undefined {
    return this.designerService.getBase64Image();
  }

  getLayerIcon(type: string | undefined): string {
    const iconMap: Record<string, string> = {
      'text': 'fluent:text-field-24-regular',
      'image': 'fluent:image-24-regular',
      'pattern': 'fluent:grid-dots-24-regular',
    };
    return iconMap[type || ''] || 'fluent:shape-subtract-24-regular';
  }

  selectedFontSize = signal(24);
  selectedFontWeight = signal(400);

  async addHeader(x = 0, y = 0) {
    const id = await this.designerService.addLayer({
      type: 'text',
      text: 'Add a heading',
      fontSize: 40,
      fontWeight: 'bold',
      fontFamily: 'Inter',
      name: 'Heading',
      align: 'center',
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  async addSubheader(x = 0, y = 0) {
    const id = await this.designerService.addLayer({
      type: 'text',
      text: 'Add a subheading',
      fontSize: 24,
      fontWeight: '600',
      fontFamily: 'Inter',
      name: 'Subheading',
      align: 'center',
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  async addBodyText(x = 0, y = 0) {
    const id = await this.designerService.addLayer({
      type: 'text',
      text: 'Add body text',
      fontSize: 16,
      fontFamily: 'Inter',
      name: 'Body text',
      align: 'center',
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  async addShape(shape: ElementConfig, x = 0, y = 0) {
    const id = await this.designerService.addLayer({
      type: 'shape',
      name: shape.name,
      data: shape.data,
      width: 100,
      height: 100,
      fill: '#64748b',
      x,
      y
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  setGradient(gradient: any) {
    this.designerService.setCanvasBackground({
      x0: gradient.x0,
      y0: gradient.y0,
      x1: gradient.x1,
      y1: gradient.y1,
      colorStops: gradient.colorStops
    });
  }

  setColor(color: string) {
    this.designerService.setCanvasBackground(color);
  }

  async addPattern(url: string) {
    const id = await this.designerService.addLayer({
      type: 'pattern',
      name: 'Pattern',
      patternImage: url,
      width: this.resizeWidth(),
      height: this.resizeHeight(),
      x: 0,
      y: 0
    });
    if (id) {
      this.selectLayer(id);
    }
  }

  applyResize() {
    this.designerService.updateSize(this.canvasContainer()!.nativeElement, {
      width: this.resizeWidth(),
      height: this.resizeHeight()
    }, true, true);
  }

  selectPreset(preset: { width: number, height: number }) {
    this.resizeWidth.set(preset.width);
    this.resizeHeight.set(preset.height);
    this.applyResize();
  }
}
