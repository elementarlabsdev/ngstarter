import { Component, signal } from '@angular/core';
import {
  TypedSignaturePad,
  type TypedSignaturePadValue,
} from '@ngstarter-ui/components/signature-pad';

@Component({
  selector: 'app-basic-typed-signature-pad-example',
  imports: [
    TypedSignaturePad
  ],
  templateUrl: './basic-typed-signature-pad-example.html',
  styleUrl: './basic-typed-signature-pad-example.scss'
})
export class BasicTypedSignaturePadExample {
  readonly signature = signal<TypedSignaturePadValue | null>(null);

  onSignatureTyped(signature: TypedSignaturePadValue): void {
    this.signature.set(signature);
  }

  onSignatureCleared(): void {
    this.signature.set(null);
  }
}
