import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteBlockComponent } from './quote-block.component';

describe('QuoteBlockComponent', () => {
  let component: QuoteBlockComponent;
  let fixture: ComponentFixture<QuoteBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
