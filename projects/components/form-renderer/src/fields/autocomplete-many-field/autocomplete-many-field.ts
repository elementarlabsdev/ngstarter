import { Component, ElementRef, inject, input, OnInit, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Autocomplete,
  AutocompleteSelectedEvent,
  AutocompleteTrigger
} from '@ngstarter/components/autocomplete';
import { Option } from '@ngstarter/components/option';
import { ChipGrid, ChipInput, ChipInputEvent, ChipRemove, ChipRow } from '@ngstarter/components/chips';
import { ComponentConfig } from '../../models/form-config.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Error, FormField, Hint, Label } from '@ngstarter/components/form-field';
import { Icon } from '@ngstarter/components/icon';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { ProgressSpinner } from '@ngstarter/components/spinner';
import { AsyncPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'ngs-autocomplete-many-field',
  imports: [
    FormsModule,
    Autocomplete,
    AutocompleteTrigger,
    ChipGrid,
    ChipInput,
    ChipRemove,
    ChipRow,
    Error,
    FormField,
    Hint,
    Icon,
    Label,
    Option,
    ReactiveFormsModule,
    ProgressSpinner,
    AsyncPipe
  ],
  templateUrl: './autocomplete-many-field.html',
  styleUrl: './autocomplete-many-field.scss'
})
export class AutocompleteManyField implements OnInit {
  private httpClient = inject(HttpClient);

  control = input.required<FormControl>();
  config = input.required<ComponentConfig>();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly chipsCtrl = new FormControl('');
  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  readonly value: any[] = [];

  filteredOptions$!: Observable<any[]>;
  isLoading = false;

  ngOnInit() {
    this.filteredOptions$ = this.chipsCtrl.valueChanges.pipe(
      startWith(''),
      tap(() => this.isLoading = true),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: any) => {
        if (!query || !query.trim()) {
          return of([]);
        }
        const params = new HttpParams().set('query', query || '');
        return this.httpClient.get<any[]>(this.config().payload?.['autocompleteUrl'], {
          params
        });
      }),
      tap(() => this.isLoading = false)
    );
  }

  getErrorMessage(): string {
    const errors = this.control().errors;

    if (!errors) {
      return '';
    }

    const errorKey = Object.keys(errors)[0];
    const validator = this.config().validators?.find((v: any) => v.type === errorKey);
    return validator?.message || 'Некорректное значение';
  }

  get options() {
    return this.config()?.payload?.['options'] || [];
  }

  get bindValue() {
    return this.config().bindValue || 'id';
  }

  get bindName() {
    return this.config().bindName || 'name';
  }

  add(event: ChipInputEvent): void {
    const name = (event.value || '').trim();
    const hasValue = this.value.find(
      v => v[this.bindName].toLowerCase() === name.toLowerCase()
    );

    if (name && !hasValue) {
      this.value.push({
        [this.bindValue]: null,
        [this.bindName]: name,
      });
    }

    event.chipInput!.clear();
    this.chipsCtrl.setValue(null);
    this.isLoading = false;
    this.calculateControlValue();
  }

  remove(chip: any): void {
    const index = this.value.indexOf(chip);

    if (index >= 0) {
      this.value.splice(index, 1);
      this.calculateControlValue();
    }
  }

  onSelected(event: AutocompleteSelectedEvent): void {
    const hasValue = this.value.find(
      v => v[this.bindName].toLowerCase() === (event.option.value as any)[this.bindName].toLowerCase()
    );

    if (!hasValue) {
      this.value.push(event.option.value);
    }

    this.input().nativeElement.value = '';
    this.chipsCtrl.setValue(null);
    this.calculateControlValue();
    this.isLoading = false;
  }

  private calculateControlValue() {
    const value = this.value.map(v => {
      const itemValue = v[this.bindValue];

      if (itemValue) {
        return {
          [this.bindValue]: itemValue,
        };
      }

      return v;
    });
    this.control().setValue(value);
  }
}
