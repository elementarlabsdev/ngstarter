import { Component, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ComponentConfig } from '../../models/form-config.model';

@Component({
  selector: 'ngs-text-content',
  imports: [],
  templateUrl: './text-content.html',
  styleUrl: './text-content.scss'
})
export class TextContent {
  config = input.required<ComponentConfig>();
  sanitizedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(
      this.config().content?.['htmlContent'] || ''
    );
  }
}
