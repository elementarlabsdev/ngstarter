import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentBuilderComponent } from './content-builder.component';

describe('ContentBuilderComponent', () => {
  let component: ContentBuilderComponent;
  let fixture: ComponentFixture<ContentBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
