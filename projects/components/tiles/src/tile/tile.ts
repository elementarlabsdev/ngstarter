import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  type OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { injectElement } from '@ngstarter-ui/components/core';

import { TileService } from '../tile.service';
import { Tiles } from '../tiles/tiles';

const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
};

@Component({
  selector: 'ngs-tile',
  exportAs: 'ngsTile',
  templateUrl: './tile.html',
  styleUrl: './tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TileService
  ],
  host: {
    '[class._dragged]': 'dragged()',
    '[class._initialized]': 'initialized()',
    '[style.--ngs-tile-w]': 'width()',
    '[style.--ngs-tile-w-sm]': 'widthSm() ?? null',
    '[style.--ngs-tile-w-md]': 'widthMd() ?? null',
    '[style.--ngs-tile-w-lg]': 'widthLg() ?? null',
    '[style.--ngs-tile-w-xl]': 'widthXl() ?? null',
    '[style.--ngs-tile-h]': 'height()',
    '[style.--ngs-tile-h-sm]': 'heightSm() ?? null',
    '[style.--ngs-tile-h-md]': 'heightMd() ?? null',
    '[style.--ngs-tile-h-lg]': 'heightLg() ?? null',
    '[style.--ngs-tile-h-xl]': 'heightXl() ?? null',
    '[style.grid-column]': 'gridColumn()',
    '[style.grid-row]': 'gridRow()',
    '[style.min-height]': 'dragged() ? heightPx() : null',
    '[style.min-width]': '"0"',
    '[style.order]': 'tiles.order().get(this) ?? 0',
    '(pointermove)': 'onPointerMove($event)',
  },
})
export class Tile implements OnDestroy, AfterViewInit {
  readonly element = injectElement();

  private readonly wrapper = viewChild.required<ElementRef<HTMLElement>>('wrapper');
  private readonly service = inject(TileService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly breakpointState = signal(this.breakpointObserver.isMatched(Object.values(BREAKPOINTS)));

  protected readonly tiles = inject(Tiles);
  protected readonly dragged = signal(false);
  protected readonly initialized = signal(false);
  protected readonly heightPx = signal<string | null>(null);

  public readonly width = input.required<number>();
  public readonly widthSm = input<number | undefined>(undefined, { alias: 'width.sm' });
  public readonly widthMd = input<number | undefined>(undefined, { alias: 'width.md' });
  public readonly widthLg = input<number | undefined>(undefined, { alias: 'width.lg' });
  public readonly widthXl = input<number | undefined>(undefined, { alias: 'width.xl' });

  public readonly height = input.required<number>();
  public readonly heightSm = input<number | undefined>(undefined, { alias: 'height.sm' });
  public readonly heightMd = input<number | undefined>(undefined, { alias: 'height.md' });
  public readonly heightLg = input<number | undefined>(undefined, { alias: 'height.lg' });
  public readonly heightXl = input<number | undefined>(undefined, { alias: 'height.xl' });

  readonly gridColumn = computed(() => {
    const cols = this.tiles.columns();
    return `span min(var(--ngs-tile-w, ${cols}), ${cols})`;
  });
  readonly gridRow = computed(() => `span var(--ngs-tile-h, ${this.height()})`);

  constructor() {
    this.breakpointObserver.observe(Object.values(BREAKPOINTS)).subscribe(() => {
      this.breakpointState.set(!this.breakpointState());
    });
  }

  onPointerMove(event: PointerEvent): void {
    if (this.dragged()) {
      return;
    }
    this.tiles.rearrange(this.element, event);
  }

  onDrag(offset: readonly [number, number], end = false): void {
    const isDragging = !Number.isNaN(offset[0]);

    this.tiles.element.set(isDragging ? this.element : null);
    this.service.setOffset(offset);

    if (isDragging) {
      if (!this.dragged()) {
        const { height } = this.element.getBoundingClientRect();
        this.heightPx.set(height + 'px');
      }
      this.dragged.set(true);
      this.tiles.onDragStart();
      this.tiles.el.classList.add('_dragged');
    } else {
      this.dragged.set(false);
      this.heightPx.set(null);
      this.tiles.el.classList.remove('_dragged');
      if (end) {
        this.tiles.onDragEnd(this);
      }
    }
  }

  public ngAfterViewInit(): void {
    this.service.init(this.wrapper()?.nativeElement);
    setTimeout(() => this.initialized.set(true));
  }

  public ngOnDestroy(): void {
    if (this.tiles.element() === this.element) {
      this.tiles.element.set(null);
    }
  }
}
