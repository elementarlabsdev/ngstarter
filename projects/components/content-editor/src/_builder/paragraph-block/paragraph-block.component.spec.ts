import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParagraphBlockComponent } from './paragraph-block.component';

describe('ParagraphBlockComponent', () => {
  let component: ParagraphBlockComponent;
  let fixture: ComponentFixture<ParagraphBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParagraphBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParagraphBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
