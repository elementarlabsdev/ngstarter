import { ImagePresetCategory } from './types';

export const PRESET_CATEGORIES: ImagePresetCategory[] = [
  {
    name: 'Instagram',
    icon: 'fluent:camera-24-regular',
    presets: [
      { name: 'Post', width: 1080, height: 1080, icon: 'fluent:image-24-regular' },
      { name: 'Story', width: 1080, height: 1920, icon: 'fluent:video-clip-24-regular' },
      { name: 'Ad', width: 1080, height: 1080, icon: 'fluent:megaphone-24-regular' },
    ]
  },
  {
    name: 'Facebook',
    icon: 'fluent:people-24-regular',
    presets: [
      { name: 'Post (Landscape)', width: 1200, height: 630, icon: 'fluent:image-24-regular' },
      { name: 'Post (Square)', width: 1080, height: 1080, icon: 'fluent:image-24-regular' },
      { name: 'Cover', width: 851, height: 315, icon: 'fluent:image-24-regular' },
    ]
  },
  {
    name: 'Youtube',
    icon: 'fluent:video-24-regular',
    presets: [
      { name: 'Thumbnail', width: 1280, height: 720, icon: 'fluent:image-24-regular' },
      { name: 'Channel', width: 2560, height: 1440, icon: 'fluent:image-24-regular' },
      { name: 'Short', width: 1080, height: 1920, icon: 'fluent:video-clip-24-regular' },
    ]
  },
  {
    name: 'LinkedIn',
    icon: 'fluent:briefcase-24-regular',
    presets: [
      { name: 'Post', width: 1200, height: 627, icon: 'fluent:image-24-regular' },
      { name: 'Banner', width: 1584, height: 396, icon: 'fluent:image-24-regular' },
      { name: 'Square', width: 1080, height: 1080, icon: 'fluent:image-24-regular' },
    ]
  },
  {
    name: 'Twitter',
    icon: 'fluent:news-24-regular',
    presets: [
      { name: 'Post', width: 1600, height: 900, icon: 'fluent:image-24-regular' },
      { name: 'Header', width: 1500, height: 500, icon: 'fluent:image-24-regular' },
      { name: 'Square', width: 1080, height: 1080, icon: 'fluent:image-24-regular' },
    ]
  },
  {
    name: 'Video',
    icon: 'fluent:video-24-regular',
    presets: [
      { name: 'Full HD', width: 1920, height: 1080, icon: 'fluent:video-24-regular' },
      { name: '4K UHD', width: 3840, height: 2160, icon: 'fluent:video-24-regular' },
      { name: 'Vertical HD', width: 1080, height: 1920, icon: 'fluent:video-24-regular' },
      { name: 'Square HD', width: 1080, height: 1080, icon: 'fluent:video-24-regular' },
    ]
  }
];
