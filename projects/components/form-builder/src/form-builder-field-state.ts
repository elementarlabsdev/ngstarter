import { signal, WritableSignal } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

interface RuntimeFieldState {
  errors: WritableSignal<readonly ValidationError.WithoutFieldTree[]>;
  uploading: WritableSignal<boolean>;
}

const states = new WeakMap<object, RuntimeFieldState>();

export function normalizeFieldValue(type: string, value: unknown): unknown {
  switch (type) {
    case 'text':
    case 'email':
    case 'textarea':
    case 'password':
      return value == null ? '' : String(value);
    case 'checkbox':
    case 'toggle':
      return !!value;
    default:
      return value ?? null;
  }
}

export function runtimeFieldState(field: object): RuntimeFieldState {
  let state = states.get(field);
  if (!state) {
    state = { errors: signal([]), uploading: signal(false) };
    states.set(field, state);
  }
  return state;
}

export function setRuntimeFieldError(field: object, kind: string, message?: string): void {
  runtimeFieldState(field).errors.update(errors => {
    const existing = errors.find(error => error.kind === kind);
    if (existing?.message === message) return errors;

    const remaining = errors.filter(error => error.kind !== kind);
    return message === undefined ? remaining : [...remaining, { kind, message }];
  });
}
