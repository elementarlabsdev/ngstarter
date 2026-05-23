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
import { GaugeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-brand-alignment-chart',
  imports: [],
  templateUrl: './brand-alignment-chart.html',
  styleUrl: './brand-alignment-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandAlignmentChart implements AfterViewInit, OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _themeManager = inject(ThemeManagerService);
  private _chart?: EChartsType;
  private _observer?: ResizeObserver;

  readonly value = input.required<number>();
  readonly _chartRef = viewChild.required('chartRef', { read: ElementRef });

  ngAfterViewInit(): void {
    if (!this._isBrowser) {
      return;
    }

    echarts.use([TooltipComponent, GaugeChart, CanvasRenderer]);

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
    const alignmentColor = styles.getPropertyValue('--alignment-chart-primary').trim() || '#efb7b9';
    const trackColor = styles.getPropertyValue('--alignment-chart-track').trim() || '#e8e8e8';
    const textColor = styles.getPropertyValue('--alignment-chart-text').trim() || '#171719';
    const mutedColor = styles.getPropertyValue('--alignment-chart-muted').trim() || '#8b8b88';

    return {
      tooltip: {
        trigger: 'item',
        borderWidth: 0,
        padding: [10, 12],
        formatter: `Brand alignment: ${this.value()}%`,
      },
      series: [
        {
          name: 'Brand alignment',
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          center: ['50%', '70%'],
          radius: '104%',
          splitNumber: 4,
          progress: {
            show: true,
            width: 38,
            roundCap: true,
            itemStyle: {
              color: alignmentColor,
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 38,
              color: [[1, trackColor]],
            },
          },
          pointer: {
            show: false,
          },
          anchor: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            offsetCenter: [0, '-4%'],
            formatter: '{value}%',
            color: textColor,
            fontSize: 38,
            fontWeight: 500,
          },
          title: {
            offsetCenter: [0, '20%'],
            color: mutedColor,
            fontSize: 15,
            fontWeight: 400,
          },
          data: [
            {
              value: this.value(),
              name: 'Voice match',
            },
          ],
        },
      ],
    };
  }
}
