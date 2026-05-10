import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import type { BarSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption, EChartsType } from 'echarts/core';

type MiniChartOption = ComposeOption<GridComponentOption | TooltipComponentOption | BarSeriesOption>;
type EChartsCore = typeof import('echarts/core');

let echartsRegistered = false;

@Component({
  selector: 'app-corporate-mini-chart',
  imports: [],
  templateUrl: './corporate-mini-chart.html',
  styleUrl: './corporate-mini-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateMiniChart implements OnDestroy {
  readonly data = input.required<readonly number[]>();
  readonly labels = input.required<readonly string[]>();
  readonly peak = input<number | undefined>();
  readonly peakIndex = input(5);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly chartHost = viewChild.required<ElementRef<HTMLDivElement>>('chartHost');
  private echartsCore?: EChartsCore;
  private chart?: EChartsType;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(async () => {
      if (!this.canUseCanvas()) {
        return;
      }

      const [echartsCore, { BarChart }, { GridComponent, MarkPointComponent, TooltipComponent }, { CanvasRenderer }] =
        await Promise.all([
          import('echarts/core'),
          import('echarts/charts'),
          import('echarts/components'),
          import('echarts/renderers'),
        ]);

      if (!echartsRegistered) {
        echartsCore.use([BarChart, GridComponent, MarkPointComponent, TooltipComponent, CanvasRenderer]);
        echartsRegistered = true;
      }

      this.echartsCore = echartsCore;
      this.chart = echartsCore.init(this.chartHost().nativeElement, undefined, {
        renderer: 'canvas',
      });
      this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
      this.resizeObserver.observe(this.elementRef.nativeElement);
      this.renderChart();
    });

    effect(() => {
      this.data();
      this.labels();
      this.peak();
      this.peakIndex();
      this.renderChart();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }

  private renderChart(): void {
    if (!this.chart || !this.echartsCore) {
      return;
    }

    const styles = getComputedStyle(this.elementRef.nativeElement);
    const primary = this.readCssVariable(styles, '--corporate-primary', '#036fe3');
    const primarySoft = this.readCssVariable(styles, '--corporate-primary-soft', '#d6eaff');
    const muted = this.readCssVariable(styles, '--corporate-muted', '#858793');
    const data = [...this.data()];
    const labels = [...this.labels()];
    const echartsCore = this.echartsCore;
    const activeIndex = data.length - 1;
    const peakIndex = this.peakIndex();
    const peak = this.peak();

    const option: MiniChartOption = {
      animation: false,
      grid: {
        top: 18,
        right: 2,
        bottom: 18,
        left: 2,
        containLabel: false,
      },
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const dataIndex = 'dataIndex' in item ? item.dataIndex : 0;
          const value = 'value' in item ? item.value : '';

          return `${labels[dataIndex] ?? ''}: ${value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: muted,
          fontSize: 12,
          fontWeight: 600,
          interval: 0,
          margin: 6,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
        min: 0,
        max: 100,
      },
      series: [
        {
          type: 'bar',
          data: data.map((value, index) => ({
            value,
            itemStyle: {
              color:
                index === activeIndex
                  ? new echartsCore.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#8cc8ff' },
                      { offset: 1, color: primary },
                    ])
                  : new echartsCore.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#e6f2ff' },
                      { offset: 1, color: primarySoft },
                    ]),
            },
          })),
          barWidth: 18,
          barMinHeight: 16,
          itemStyle: {
            borderRadius: 999,
          },
          markPoint:
            peak === undefined
              ? undefined
              : {
                  symbol: 'roundRect',
                  symbolSize: [28, 18],
                  symbolOffset: [0, -16],
                  itemStyle: {
                    color: '#343242',
                  },
                  label: {
                    show: true,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    formatter: String(peak),
                  },
                  data: [
                    {
                      name: 'Peak',
                      coord: [peakIndex, data[peakIndex] ?? 0],
                      value: peak,
                    },
                  ],
                },
        },
      ],
    };

    this.chart.setOption(option, true);
  }

  private readCssVariable(styles: CSSStyleDeclaration, name: string, fallback: string): string {
    return styles.getPropertyValue(name).trim() || fallback;
  }

  private canUseCanvas(): boolean {
    if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom')) {
      return false;
    }

    try {
      return !!document.createElement('canvas').getContext('2d');
    } catch {
      return false;
    }
  }
}
