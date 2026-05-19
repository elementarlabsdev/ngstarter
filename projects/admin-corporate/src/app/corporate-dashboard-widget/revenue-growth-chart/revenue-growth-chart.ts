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
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-revenue-growth-chart',
  imports: [],
  templateUrl: './revenue-growth-chart.html',
  styleUrl: './revenue-growth-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueGrowthChart implements AfterViewInit, OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _themeManager = inject(ThemeManagerService);
  private _chart?: EChartsType;
  private _observer?: ResizeObserver;

  readonly values = input.required<readonly number[]>();
  readonly labels = input.required<readonly string[]>();
  readonly _chartRef = viewChild.required('chartRef', { read: ElementRef });

  ngAfterViewInit(): void {
    if (!this._isBrowser) {
      return;
    }

    echarts.use([
      TooltipComponent,
      GridComponent,
      BarChart,
      LabelLayout,
      UniversalTransition,
      CanvasRenderer,
    ]);

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
    return {
      grid: {
        top: 18,
        right: 18,
        bottom: 24,
        left: 34,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        borderWidth: 0,
        padding: [10, 12],
        formatter: (params: any) => {
          const point = params[0];

          return `<strong>${point.name}</strong><br />Revenue growth: ${point.value}%`;
        },
      },
      xAxis: {
        type: 'category',
        data: this.labels(),
        axisLabel: {
          color: '#596171',
          fontSize: 11,
          fontWeight: 500,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(137, 146, 166, 0.24)',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: '#8a90a0',
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
            color: 'rgba(137, 146, 166, 0.14)',
          },
        },
      },
      series: [
        {
          name: 'Revenue Growth',
          type: 'bar',
          data: this.values(),
          barWidth: 56,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(49, 104, 232, 0.08)',
            borderRadius: [7, 7, 0, 0],
          },
          itemStyle: {
            color: '#3168e8',
            borderRadius: [7, 7, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#3f4552',
            fontSize: 11,
            fontWeight: 500,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#174ed8',
              shadowBlur: 12,
              shadowColor: 'rgba(15, 23, 42, 0.14)',
            },
          },
        },
      ],
    };
  }
}
