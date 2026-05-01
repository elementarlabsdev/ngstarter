import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPlayer } from './video-player';

describe('VideoPlayer', () => {
  let component: VideoPlayer;
  let fixture: ComponentFixture<VideoPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not toggle play when disableClickToPlay is true and container is clicked', () => {
    const togglePlaySpy = vi.spyOn(component, 'togglePlay');
    fixture.componentRef.setInput('disableClickToPlay', true);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.video-container');
    container.click();

    expect(togglePlaySpy).not.toHaveBeenCalled();
  });

  it('should toggle play when disableClickToPlay is false and container is clicked', () => {
    const togglePlaySpy = vi.spyOn(component, 'togglePlay');
    fixture.componentRef.setInput('disableClickToPlay', false);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.video-container');
    container.click();

    expect(togglePlaySpy).toHaveBeenCalled();
  });

  it('should emit onLoaded when data is loaded', () => {
    const onLoadedSpy = vi.spyOn(component.onLoaded, 'emit');
    // @ts-ignore - accessing private for testing
    component.onLoadedData();
    expect(onLoadedSpy).toHaveBeenCalled();
  });
});
