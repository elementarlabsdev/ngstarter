import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EnvironmentProviders,
  InjectionToken,
  NgZone,
  OnDestroy,
  Renderer2,
  booleanAttribute,
  effect,
  inject,
  input,
  makeEnvironmentProviders,
  output,
  signal,
  viewChildren,
} from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  SplitArea,
  SplitAreaSnapshot,
  SplitDefaultOptions,
  SplitOutputAreaSizes,
  SplitOutputData,
  SplitPoint,
  SplitSnapshot,
} from '../interfaces';
import { SplitPane } from '../split-pane';
import {
  getAreaMaxSize,
  getAreaMinSize,
  getElementPixelSize,
  getGutterSideAbsorptionCapacity,
  getInputPositiveNumber,
  getPointFromEvent,
  isUserSizesValid,
  updateAreaSize,
} from '../utils';

/** Injection token that can be used to specify default split options. */
export const SPLIT_DEFAULT_OPTIONS = new InjectionToken<SplitDefaultOptions>(
  'SPLIT_DEFAULT_OPTIONS'
);

/**
 * Configures the default options for the split component.
 * @param options The default options to use.
 * @returns The environment providers.
 */
export function provideSplit(options: SplitDefaultOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SPLIT_DEFAULT_OPTIONS, useValue: options },
  ]);
}

@Component({
  selector: 'ngs-split',
  exportAs: 'ngsSplit',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split.html',
  styleUrl: './split.scss',
  host: {
    class: 'ngs-split',
    '[class.ngs-split-horizontal]': 'direction() === "horizontal"',
    '[class.ngs-split-vertical]': 'direction() === "vertical"',
    '[class.ngs-split-percent]': 'unit() === "percent"',
    '[class.ngs-split-pixel]': 'unit() === "pixel"',
    '[class.ngs-split-disabled]': 'disabled()',
    '[class.ngs-split-transition]': 'useTransition()',
    '[class.ngs-dragging]': 'isDraggingSignal()',
    '[class.ngs-split-init]': 'isInitSignal()',
  },
})
export class Split implements AfterViewInit, OnDestroy {
  shouldShowHandle(gutterIndex: number): boolean {
    // show if either adjacent pane has withHandle=true
    const left = this.displayedAreas[gutterIndex]?.component as SplitPane | undefined;
    const right = this.displayedAreas[gutterIndex + 1]?.component as SplitPane | undefined;
    return !!(left?.hasHandle() || right?.hasHandle());
  }
  private ngZone = inject(NgZone);
  private elRef = inject(ElementRef);
  private cdRef = inject(ChangeDetectorRef);
  private renderer = inject(Renderer2);
  private isInit = signal(false);
  protected _defaultOptions = inject<SplitDefaultOptions>(SPLIT_DEFAULT_OPTIONS, {
    optional: true,
  });

  /** The split direction. */
  direction = input<'horizontal' | 'vertical'>(this._defaultOptions?.direction ?? 'horizontal');

  /** The unit you want to specify area sizes. */
  unit = input<'percent' | 'pixel'>(this._defaultOptions?.unit ?? 'percent');

  /** Gutters's size (dragging elements) in pixels. */
  gutterSize = input(this._defaultOptions?.gutterSize ?? 5, {
    transform: (v: number | string) => getInputPositiveNumber(v, 4),
  });

  /** Gutter step while moving in pixels. */
  gutterStep = input(this._defaultOptions?.gutterStep ?? 1, {
    transform: (v: number | string) => getInputPositiveNumber(v, 1),
  });

  /** Set to true if you want to limit gutter move to adjacent areas only. */
  restrictMove = input(this._defaultOptions?.restrictMove ?? false, { transform: booleanAttribute });

  /** Add transition when toggling visibility using `visible` or `size` changes. */
  useTransition = input(this._defaultOptions?.useTransition ?? false, { transform: booleanAttribute });

  /**
   * Disable the dragging feature (remove cursor/image on gutters).
   * `gutterClick`/`gutterDblClick` still emits.
   */
  disabled = input(false, { transform: booleanAttribute });

  /** Indicates the directionality of the areas. */
  dir = input<'ltr' | 'rtl'>(this._defaultOptions?.dir ?? 'ltr');

  /**
   * Milliseconds to detect a double click on a gutter. Set it around 300-500ms if
   * you want to use `gutterDblClick` event.
   */
  gutterDblClickDuration = input(this._defaultOptions?.gutterDblClickDuration ?? 0, {
    transform: (v: number | string) => getInputPositiveNumber(v, 0),
  });

  /** Event emitted when drag starts. */
  dragStart = output<SplitOutputData>();
  /** Event emitted when drag ends. */
  dragEnd = output<SplitOutputData>();
  /** Event emitted when user clicks on a gutter. */
  gutterClick = output<SplitOutputData>();
  /** Event emitted when user double clicks on a gutter. */
  gutterDblClick = output<SplitOutputData>();
  /** Event emitted when transition ends (debounced). */
  transitionEnd = output<SplitOutputAreaSizes>();
  private transitionEndSubject = new Subject<SplitOutputAreaSizes>();

  private dragProgressSubject = new Subject<SplitOutputData>();
  dragProgress$: Observable<SplitOutputData> = this.dragProgressSubject.asObservable();


  private isDragging = signal(false);
  private dragListeners: (() => void)[] = [];
  private snapshot: SplitSnapshot | null = null;
  private startPoint: SplitPoint | null = null;
  private endPoint: SplitPoint | null = null;

  public readonly displayedAreas: SplitArea[] = [];
  private readonly hidedAreas: SplitArea[] = [];

  private gutterEls = viewChildren<ElementRef>('gutterEls');

  protected isDraggingSignal = this.isDragging.asReadonly();
  public readonly isDraggingPublic = this.isDragging.asReadonly();
  protected isInitSignal = this.isInit.asReadonly();

  constructor() {
    // Debounce transitionEnd output
    this.transitionEndSubject.pipe(debounceTime<any>(20)).subscribe(sizes => {
      this.transitionEnd.emit(sizes);
    });

    effect(() => {
      this.direction();
      this.cdRef.markForCheck();
      this.build(false, false);
    });

    effect(() => {
      this.unit();
      this.cdRef.markForCheck();
      this.build(false, true);
    });

    effect(() => {
      this.gutterSize();
      this.build(false, false);
    });

    effect(() => {
      this.useTransition();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.disabled();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.renderer.setAttribute(this.elRef.nativeElement, 'dir', this.dir());
    });
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      // To avoid transition at first rendering
      setTimeout(() => {
        this.isInit.set(true);
        this.cdRef.markForCheck();
      });
    });
  }

  private getNbGutters(): number {
    return this.displayedAreas.length === 0 ? 0 : this.displayedAreas.length - 1;
  }

  addArea(component: SplitPane): void {
    const newArea: SplitArea = {
      component,
      order: 0,
      size: 0,
      minSize: null,
      maxSize: null,
    };

    if (component.isVisible() === true) {
      this.displayedAreas.push(newArea);

      this.build(true, true);
    } else {
      this.hidedAreas.push(newArea);
    }
  }

  removeArea(component: SplitPane): void {
    if (this.displayedAreas.some(a => a.component === component)) {
      const area = this.displayedAreas.find(a => a.component === component) as SplitArea;
      this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);

      this.build(true, true);
    } else if (this.hidedAreas.some(a => a.component === component)) {
      const area = this.hidedAreas.find(a => a.component === component) as SplitArea;
      this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
    }
  }

  updateArea(component: SplitPane, resetOrders: boolean, resetSizes: boolean): void {
    if (component.isVisible() === true) {
      this.build(resetOrders, resetSizes);
    }
  }

  updateAreaInternal(component: SplitPane): void {
    const area = this.displayedAreas.find(a => a.component === component);
    if (area) {
      area.size = component.getSize();
    }
  }

  showArea(component: SplitPane): void {
    const area = this.hidedAreas.find(a => a.component === component);
    if (area === undefined) {
      return;
    }

    const areas = this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
    this.displayedAreas.push(...areas);

    this.build(true, true);
  }

  hideArea(comp: SplitPane): void {
    const area = this.displayedAreas.find(a => a.component === comp);
    if (area === undefined) {
      return;
    }

    const areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
    areas.forEach(_area => {
      _area.order = 0;
      _area.size = 0;
    });
    this.hidedAreas.push(...areas);

    this.build(true, true);
  }

  getVisibleAreaSizes(): SplitOutputAreaSizes {
    return this.displayedAreas.map(a => (a.size === null ? '*' : a.size));
  }

  setVisibleAreaSizes(sizes: SplitOutputAreaSizes): boolean {
    if (sizes.length !== this.displayedAreas.length) {
      return false;
    }

    const formatedSizes = sizes.map(s => getInputPositiveNumber(s, null)) as number[];
    const isValid = isUserSizesValid(this.unit(), formatedSizes);

    if (isValid === false) {
      return false;
    }

    this.displayedAreas.forEach((area, i) => area.component.setSize(formatedSizes[i]));

    this.build(false, true);
    return true;
  }

  private build(resetOrders: boolean, resetSizes: boolean): void {
    // ¤ AREAS ORDER

    if (resetOrders === true) {
      // If user provided 'order' for each area, use it to sort them.
      if (this.displayedAreas.every(a => a.component.getOrder() !== null)) {
        this.displayedAreas.sort(
          (a, b) => (a.component.getOrder() as number) - (b.component.getOrder() as number)
        );
      }

      // Then set real order with multiples of 2, numbers between will be used by gutters.
      this.displayedAreas.forEach((area, i) => {
        area.order = i * 2;
        area.component.setStyleOrder(area.order);
      });
    }

    // ¤ AREAS SIZE

    if (resetSizes === true) {
      const useUserSizes = isUserSizesValid(
        this.unit(),
        this.displayedAreas.map(a => a.component.getSize()) as number[]
      );

      switch (this.unit()) {
        case 'percent': {
          const defaultSize = 100 / this.displayedAreas.length;

          this.displayedAreas.forEach(area => {
            area.size = useUserSizes ? (area.component.getSize() as number) : defaultSize;
            area.minSize = getAreaMinSize(area);
            area.maxSize = getAreaMaxSize(area);
          });
          break;
        }
        case 'pixel': {
          if (useUserSizes) {
            this.displayedAreas.forEach(area => {
              area.size = area.component.getSize();
              area.minSize = getAreaMinSize(area);
              area.maxSize = getAreaMaxSize(area);
            });
          } else {
            const wildcardSizeAreas = this.displayedAreas.filter(a => a.component.getSize() === null);

            // No wildcard area > Need to select one arbitrarily > first
            if (wildcardSizeAreas.length === 0 && this.displayedAreas.length > 0) {
              this.displayedAreas.forEach((area, i) => {
                area.size = i === 0 ? null : area.component.getSize();
                area.minSize = i === 0 ? null : getAreaMinSize(area);
                area.maxSize = i === 0 ? null : getAreaMaxSize(area);
              });
            }
            // More than one wildcard area > Need to keep only one arbitrarly > first
            else if (wildcardSizeAreas.length > 1) {
              let alreadyGotOne = false;
              this.displayedAreas.forEach(area => {
                if (area.component.getSize() === null) {
                  if (alreadyGotOne === false) {
                    area.size = null;
                    area.minSize = null;
                    area.maxSize = null;
                    alreadyGotOne = true;
                  } else {
                    area.size = 100;
                    area.minSize = null;
                    area.maxSize = null;
                  }
                } else {
                  area.size = area.component.getSize();
                  area.minSize = getAreaMinSize(area);
                  area.maxSize = getAreaMaxSize(area);
                }
              });
            }
          }
          break;
        }
      }
    }

    this.refreshStyleSizes();
    this.cdRef.markForCheck();
  }

  private refreshStyleSizes(): void {
    ///////////////////////////////////////////
    // PERCENT MODE
    if (this.unit() === 'percent') {
      // Only one area > flex-basis 100%
      if (this.displayedAreas.length === 1) {
        this.displayedAreas[0].component.setStyleFlex(0, 0, `100%`, false, false);
      }
      // Multiple areas > use each percent basis
      else {
        const sumGutterSize = this.getNbGutters() * this.gutterSize();

        this.displayedAreas.forEach(area => {
          area.component.setStyleFlex(
            0,
            0,
            `calc( ${area.size}% - ${((area.size as number) / 100) * sumGutterSize}px )`,
            area.minSize !== null && area.minSize === area.size ? true : false,
            area.maxSize !== null && area.maxSize === area.size ? true : false
          );
        });
      }
    }
    ///////////////////////////////////////////
    // PIXEL MODE
    else if (this.unit() === 'pixel') {
      this.displayedAreas.forEach(area => {
        // Area with wildcard size
        if (area.size === null) {
          if (this.displayedAreas.length === 1) {
            area.component.setStyleFlex(1, 1, `100%`, false, false);
          } else {
            area.component.setStyleFlex(1, 1, `auto`, false, false);
          }
        }
        // Area with pixel size
        else {
          // Only one area > flex-basis 100%
          if (this.displayedAreas.length === 1) {
            area.component.setStyleFlex(0, 0, `100%`, false, false);
          }
          // Multiple areas > use each pixel basis
          else {
            area.component.setStyleFlex(
              0,
              0,
              `${area.size}px`,
              area.minSize !== null && area.minSize === area.size ? true : false,
              area.maxSize !== null && area.maxSize === area.size ? true : false
            );
          }
        }
      });
    }
  }

  _clickTimeout: number | null = null;

  clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void {
    const tempPoint = getPointFromEvent(event) as SplitPoint;

    // Be sure mouseup/touchend happened at same point as mousedown/touchstart to trigger click/dblclick
    if (this.startPoint && this.startPoint.x === tempPoint.x && this.startPoint.y === tempPoint.y) {
      // If timeout in progress and new click > clearTimeout & dblClickEvent
      if (this._clickTimeout !== null) {
        window.clearTimeout(this._clickTimeout);
        this._clickTimeout = null;
        this.notify('dblclick', gutterNum);
        this.stopDragging();
      }
      // Else start timeout to call clickEvent at end
      else {
        this._clickTimeout = window.setTimeout(() => {
          this._clickTimeout = null;
          this.notify('click', gutterNum);
          this.stopDragging();
        }, this.gutterDblClickDuration());
      }
    }
  }

  startDragging(event: MouseEvent | TouchEvent, gutterOrder: number, gutterNum: number): void {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();

    this.startPoint = getPointFromEvent(event);
    if (this.startPoint === null || this.disabled() === true) {
      return;
    }

    this.isDragging.set(true);
    this.cdRef.markForCheck();

    this.snapshot = {
      gutterNum,
      lastSteppedOffset: 0,
      allAreasSizePixel:
        getElementPixelSize(this.elRef, this.direction()) - this.getNbGutters() * this.gutterSize(),
      allInvolvedAreasSizePercent: 100,
      areasBeforeGutter: [],
      areasAfterGutter: [],
    };

    this.displayedAreas.forEach(area => {
      const areaSnapshot: SplitAreaSnapshot = {
        area,
        sizePixelAtStart: getElementPixelSize(area.component.elRef, this.direction()),
        sizePercentAtStart: (this.unit() === 'percent' ? area.size : -1) as number, // If pixel mode, anyway, will not be used.
      };

      if (area.order < gutterOrder) {
        if (this.restrictMove() === true) {
          (this.snapshot as SplitSnapshot).areasBeforeGutter = [areaSnapshot];
        } else {
          (this.snapshot as SplitSnapshot).areasBeforeGutter.unshift(areaSnapshot);
        }
      } else if (area.order > gutterOrder) {
        if (this.restrictMove() === true) {
          if ((this.snapshot as SplitSnapshot).areasAfterGutter.length === 0) {
            (this.snapshot as SplitSnapshot).areasAfterGutter = [areaSnapshot];
          }
        } else {
          (this.snapshot as SplitSnapshot).areasAfterGutter.push(areaSnapshot);
        }
      }
    });

    this.snapshot.allInvolvedAreasSizePercent = [
      ...this.snapshot.areasBeforeGutter,
      ...this.snapshot.areasAfterGutter,
    ].reduce((t, a) => t + (a.sizePercentAtStart > 0 ? a.sizePercentAtStart : 0), 0);

    if (
      this.snapshot.areasBeforeGutter.length === 0 ||
      this.snapshot.areasAfterGutter.length === 0
    ) {
      return;
    }

    this.dragListeners.push(
      this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this))
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchend', this.stopDragging.bind(this))
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this))
    );

    this.ngZone.runOutsideAngular(() => {
      this.dragListeners.push(
        this.renderer.listen('document', 'mousemove', this.dragEvent.bind(this))
      );
      this.dragListeners.push(
        this.renderer.listen('document', 'touchmove', this.dragEvent.bind(this))
      );
    });

    this.displayedAreas.forEach(area => area.component.lockEvents());

    this.isDragging.set(true);
    this.renderer.addClass(this.elRef.nativeElement, 'ngs-dragging');
    this.renderer.addClass(
      this.gutterEls()![this.snapshot.gutterNum - 1].nativeElement,
      'ngs-dragged'
    );

    this.notify('start', this.snapshot.gutterNum);
  }

  private dragEvent(event: MouseEvent | TouchEvent): void {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();

    if (this._clickTimeout !== null) {
      window.clearTimeout(this._clickTimeout);
      this._clickTimeout = null;
    }

    if (this.isDragging() === false) {
      return;
    }

    this.endPoint = getPointFromEvent(event);
    if (this.endPoint === null) {
      return;
    }

    // Calculate steppedOffset

    let offset =
      this.direction() === 'horizontal'
        ? (this.startPoint as SplitPoint).x - this.endPoint.x
        : (this.startPoint as SplitPoint).y - this.endPoint.y;
    if (this.dir() === 'rtl' && this.direction() === 'horizontal') {
      offset = -offset;
    }
    const steppedOffset = Math.round(offset / this.gutterStep()) * this.gutterStep();

    if (steppedOffset === (this.snapshot as SplitSnapshot).lastSteppedOffset) {
      return;
    }

    (this.snapshot as SplitSnapshot).lastSteppedOffset = steppedOffset;

    // Need to know if each gutter side areas could reacts to steppedOffset

    let areasBefore = getGutterSideAbsorptionCapacity(
      this.unit(),
      (this.snapshot as SplitSnapshot).areasBeforeGutter,
      -steppedOffset,
      (this.snapshot as SplitSnapshot).allAreasSizePixel
    );
    let areasAfter = getGutterSideAbsorptionCapacity(
      this.unit(),
      (this.snapshot as SplitSnapshot).areasAfterGutter,
      steppedOffset,
      (this.snapshot as SplitSnapshot).allAreasSizePixel
    );

    // Each gutter side areas can't absorb all offset
    if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
      if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) {
        /** */
      } else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
        areasAfter = getGutterSideAbsorptionCapacity(
          this.unit(),
          (this.snapshot as SplitSnapshot).areasAfterGutter,
          steppedOffset + areasBefore.remain,
          (this.snapshot as SplitSnapshot).allAreasSizePixel
        );
      } else {
        areasBefore = getGutterSideAbsorptionCapacity(
          this.unit(),
          (this.snapshot as SplitSnapshot).areasBeforeGutter,
          -(steppedOffset - areasAfter.remain),
          (this.snapshot as SplitSnapshot).allAreasSizePixel
        );
      }
    }
    // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after gutter.
    else if (areasBefore.remain !== 0) {
      areasAfter = getGutterSideAbsorptionCapacity(
        this.unit(),
        (this.snapshot as SplitSnapshot).areasAfterGutter,
        steppedOffset + areasBefore.remain,
        (this.snapshot as SplitSnapshot).allAreasSizePixel
      );
    }
    // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before gutter.
    else if (areasAfter.remain !== 0) {
      areasBefore = getGutterSideAbsorptionCapacity(
        this.unit(),
        (this.snapshot as SplitSnapshot).areasBeforeGutter,
        -(steppedOffset - areasAfter.remain),
        (this.snapshot as SplitSnapshot).allAreasSizePixel
      );
    }

    if (this.unit() === 'percent') {
      // Hack because of browser messing up with sizes using calc(X% - Ypx) -> el.getBoundingClientRect()
      // If not there, playing with gutters makes total going down to 99.99875% then 99.99286%, 99.98986%,..
      const all = [...areasBefore.list, ...areasAfter.list];
      const areaToReset = all.find(
        a =>
          a.percentAfterAbsorption !== 0 &&
          a.percentAfterAbsorption !== a.areaSnapshot.area.minSize &&
          a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize
      );

      if (areaToReset) {
        areaToReset.percentAfterAbsorption =
          (this.snapshot as SplitSnapshot).allInvolvedAreasSizePercent -
          all
            .filter(a => a !== areaToReset)
            .reduce((total, a) => total + a.percentAfterAbsorption, 0);
      }
    }

    // Now we know areas could absorb steppedOffset, time to really update sizes

    areasBefore.list.forEach(item => updateAreaSize(this.unit(), item));
    areasAfter.list.forEach(item => updateAreaSize(this.unit(), item));

    this.refreshStyleSizes();
    this.notify('progress', (this.snapshot as SplitSnapshot).gutterNum);
  }

  private stopDragging(event?: Event): void {
    if (event && event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isDragging() === false) {
      return;
    }

    this.displayedAreas.forEach(area => area.component.unlockEvents());

    while (this.dragListeners.length > 0) {
      const fct = this.dragListeners.pop();
      if (fct) {
        fct();
      }
    }

    // Warning: Have to be before "notify('end')"
    // because "notify('end')"" can be linked to "[size]='x'" > "build()" > "stopDragging()"
    this.isDragging.set(false);
    this.cdRef.markForCheck();

    // If moved from starting point, notify end
    if (
      this.endPoint &&
      ((this.startPoint as SplitPoint).x !== this.endPoint.x ||
        (this.startPoint as SplitPoint).y !== this.endPoint.y)
    ) {
      this.notify('end', (this.snapshot as SplitSnapshot).gutterNum);
    }

    this.renderer.removeClass(this.elRef.nativeElement, 'ngs-dragging');
    this.renderer.removeClass(
      this.gutterEls()![ (this.snapshot as SplitSnapshot).gutterNum - 1].nativeElement,
      'ngs-dragged'
    );
    this.snapshot = null;

    // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.startPoint = null;
        this.endPoint = null;
      });
    });
  }

  notify(
    type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd',
    gutterNum: number
  ): void {
    const sizes = this.getVisibleAreaSizes();

    if (type === 'start') {
      this.dragStart.emit({ gutterNum, sizes });
    } else if (type === 'end') {
      this.dragEnd.emit({ gutterNum, sizes });
    } else if (type === 'click') {
      this.gutterClick.emit({ gutterNum, sizes });
    } else if (type === 'dblclick') {
      this.gutterDblClick.emit({ gutterNum, sizes });
    } else if (type === 'transitionEnd') {
      this.ngZone.run(() => this.transitionEndSubject.next(sizes));
    } else if (type === 'progress') {
      // Stay outside zone to allow users do what they want about change detection mechanism.
      this.dragProgressSubject.next({ gutterNum, sizes });
    }
  }

  ngOnDestroy(): void {
    this.stopDragging();
  }
}
