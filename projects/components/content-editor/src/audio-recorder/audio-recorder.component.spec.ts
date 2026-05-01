import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioRecorderComponent } from './audio-recorder.component';

describe('AudioRecorderComponent', () => {
  let component: AudioRecorderComponent;
  let fixture: ComponentFixture<AudioRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioRecorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
