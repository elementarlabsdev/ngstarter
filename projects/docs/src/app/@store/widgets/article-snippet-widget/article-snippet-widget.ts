import { Component, inject, input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Ripple } from '@ngstarter-ui/components/core';

export interface ArticleSnippetWidget {
  title: string;
  publishedAt: Date | string;
  imagePreviewUrl: string;
}

@Component({
  selector: 'ngs-article-snippet-content',
  imports: [
    DatePipe,
    Ripple
  ],
  templateUrl: './article-snippet-widget.html',
  styleUrl: './article-snippet-widget.css'
})
export class ArticleSnippetWidget implements OnInit {
  private _grid = inject<Grid>(GRID, { optional: true });

  id = input.required<any>();
  content = input.required<ArticleSnippetWidget>();

  ngOnInit() {
    if (this._grid && this.content()) {
      this._grid.markItemAsLoaded(this.id());
    }
  }
}
