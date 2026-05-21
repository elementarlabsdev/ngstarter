import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { ThemeManagerService } from '@ngstarter-ui/components/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, MarkPointComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-generation-latency-chart',
  imports: [],
  templateUrl: './generation-latency-chart.html',
  styleUrl: './generation-latency-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerationLatencyChart implements AfterViewInit, OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _themeManager = inject(ThemeManagerService);
  private _chart?: EChartsType;
  private _observer?: ResizeObserver;

  readonly labels = input.required<readonly string[]>();
  readonly values = input.required<readonly number[]>();
  readonly _chartRef = viewChild.required('chartRef', { read: ElementRef });

  ngAfterViewInit(): void {
    if (!this._isBrowser) {
      return;
    }

    echarts.use([TooltipComponent, GridComponent, MarkPointComponent, LineChart, CanvasRenderer]);

    this._chart = echarts.init(
      this._chartRef().nativeElement,
      this._themeManager.getPreferredColorScheme(),
    );
    this._chart.setOption(this._buildOption());

    this._observer = new ResizeObserver(() => this._chart?.resize());
    this._observer.observe(this._host.nativeElement);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
    this._chart?.dispose();
  }

  private _buildOption(): EChartsCoreOption {
    const styles = getComputedStyle(this._host.nativeElement);
    const lineColor = styles.getPropertyValue('--latency-chart-line').trim() || '#8cc96e';
    const areaColor = styles.getPropertyValue('--latency-chart-area').trim() || 'rgba(140, 201, 110, 0.24)';
    const gridColor = styles.getPropertyValue('--latency-chart-grid').trim() || 'rgba(137, 146, 166, 0.12)';
    const mutedColor = styles.getPropertyValue('--latency-chart-muted').trim() || '#8b8b88';
    const textColor = styles.getPropertyValue('--latency-chart-text').trim() || '#171719';

    return {
      grid: {
        top: 14,
        right: 14,
        bottom: 30,
        left: 36,
      },
      tooltip: {
        trigger: 'axis',
        borderWidth: 0,
        padding: [10, 12],
        valueFormatter: (value: number | string) => `${value}s`,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(23, 23, 25, 0.32)',
            type: 'dashed',
          },
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.labels(),
        axisLabel: {
          color: mutedColor,
          fontSize: 12,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        min: 1,
        max: 3,
        axisLabel: {
          formatter: '{value}s',
          color: mutedColor,
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: gridColor,
          },
        },
      },
      series: [
        {
          name: 'Generation latency',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: this.values(),
          lineStyle: {
            color: lineColor,
            width: 3,
          },
          itemStyle: {
            color: lineColor,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: areaColor },
                { offset: 1, color: 'rgba(255, 255, 255, 0)' },
              ],
            },
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 8,
            data: [{ name: 'Peak', coord: ['12:00', 2.4], value: '2.4s' }],
            label: {
              show: true,
              formatter: '2.4s',
              position: 'top',
              distance: 10,
              color: textColor,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#ffffff',
              borderRadius: 999,
              padding: [5, 10],
            },
            itemStyle: {
              color: textColor,
            },
          },
        },
      ],
    };
  }
}
