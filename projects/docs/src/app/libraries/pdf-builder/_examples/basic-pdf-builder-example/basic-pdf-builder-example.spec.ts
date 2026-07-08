import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BasicPdfBuilderExample } from './basic-pdf-builder-example';

describe('BasicPdfBuilderExample', () => {
  let component: BasicPdfBuilderExample;
  let fixture: ComponentFixture<BasicPdfBuilderExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicPdfBuilderExample],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicPdfBuilderExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
