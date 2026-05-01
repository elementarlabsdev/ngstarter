import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentBuilder } from './content-builder';

describe('ContentBuilder', () => {
  let component: ContentBuilder;
  let fixture: ComponentFixture<ContentBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
