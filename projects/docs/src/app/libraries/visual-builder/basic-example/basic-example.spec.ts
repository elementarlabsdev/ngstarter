import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicExample } from './basic-example';

describe('BasicExample', () => {
  let component: BasicExample;
  let fixture: ComponentFixture<BasicExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicExample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
