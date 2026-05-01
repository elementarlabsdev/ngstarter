import { booleanAttribute, Component, input, numberAttribute } from '@angular/core';
import { DataViewActionBarAPI } from '../types';

@Component({
  selector: 'ngs-data-view-action-bar',
  exportAs: 'ngsDataViewActionBar',
  templateUrl: './data-view-action-bar.html',
  styleUrl: './data-view-action-bar.scss',
  host: {
    'class': 'ngs-data-view-action-bar',
    '[class.force-visible]': 'forceVisible() || _forceVisible'
  }
})
export class DataViewActionBar {
  forceVisible = input(false, {
    transform: booleanAttribute
  });
  width = input(100, {
    transform: numberAttribute
  });
  protected _forceVisible = false;

  get api(): DataViewActionBarAPI {
    return {
      setForceVisible: (forceVisible: boolean): void => {
        this._forceVisible = forceVisible;
      },
    }
  }
}
