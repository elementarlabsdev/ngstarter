import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { SignaturePad } from '@ngstarter-ui/components/signature-pad';

@Component({
  selector: 'app-basic-signature-pad-example',
  imports: [
    SignaturePad
  ],
  templateUrl: './basic-signature-pad-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-signature-pad-example.scss'
})
export class BasicSignaturePadExample {
  signature = signal('');

  onSignatureSaved(signature: string) {
    console.log(signature);
    this.signature.set(signature);
  }

  onSignatureCleared() {
    this.signature.set('');
  }
}
