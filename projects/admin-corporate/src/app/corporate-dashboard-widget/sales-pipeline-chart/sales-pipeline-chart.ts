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

interface PipelineStage {
  readonly label: string;
  readonly count: string;
  readonly value: string;
  readonly progress: number;
  readonly tone: 'primary' | 'accent' | 'success';
}

interface PipelineChartDatum {
  readonly name: string;
  readonly value: number;
  readonly count: string;
  readonly pipelineValue: string;
  readonly itemStyle: {
    readonly color: string;
  };
}

@Component({
  selector: 'app-sales-pipeline-chart',
  imports: [],
  templateUrl: './sales-pipeline-chart.html',
  styleUrl: './sales-pipeline-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPipelineChart implements AfterViewInit, OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _themeManager = inject(ThemeManagerService);
  private _chart?: EChartsType;
  private _observer?: ResizeObserver;

  readonly stages = input.required<readonly PipelineStage[]>();
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
    this._chart.setOption(this._buildOption(this.stages()));

    this._observer = new ResizeObserver(() => this._chart?.resize());
    this._observer.observe(this._host.nativeElement);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
    this._chart?.dispose();
  }

  private _buildOption(stages: readonly PipelineStage[]): EChartsCoreOption {
    const data = stages.map(stage => this._toDatum(stage));

    return {
      grid: {
        top: 12,
        right: 76,
        bottom: 18,
        left: 108,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        borderWidth: 0,
        padding: [10, 12],
        formatter: (params: any) => {
          const stage = params[0].data as PipelineChartDatum;

          return [
            `<strong>${stage.name}</strong>`,
            `${stage.count}`,
            `${stage.pipelineValue}`,
            `${stage.value}% conversion weight`,
          ].join('<br />');
        },
      },
      xAxis: {
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
            color: 'rgba(137, 146, 166, 0.16)',
          },
        },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map(stage => stage.name),
        axisLabel: {
          color: '#414856',
          fontSize: 12,
          fontWeight: 500,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: 'Sales Pipeline',
          type: 'bar',
          data,
          barWidth: 28,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(137, 146, 166, 0.12)',
            borderRadius: [0, 8, 8, 0],
          },
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const stage = params.data as PipelineChartDatum;

              return stage.pipelineValue;
            },
            color: '#535b6b',
            fontSize: 12,
            fontWeight: 500,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(15, 23, 42, 0.14)',
            },
          },
        },
      ],
    };
  }

  private _toDatum(stage: PipelineStage): PipelineChartDatum {
    return {
      name: stage.label,
      value: stage.progress,
      count: stage.count,
      pipelineValue: stage.value,
      itemStyle: {
        color: this._getToneColor(stage.tone),
      },
    };
  }

  private _getToneColor(tone: PipelineStage['tone']): string {
    const styles = getComputedStyle(this._host.nativeElement);

    if (tone === 'accent') {
      return styles.getPropertyValue('--pipeline-accent').trim() || '#f4b24b';
    }

    if (tone === 'success') {
      return styles.getPropertyValue('--pipeline-success').trim() || '#56c39c';
    }

    return styles.getPropertyValue('--pipeline-primary').trim() || '#4979ec';
  }
}
