import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingBlockComponent } from './heading-block.component';

describe('HeadingBlockComponent', () => {
  let component: HeadingBlockComponent;
  let fixture: ComponentFixture<HeadingBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
