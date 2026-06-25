import { InjectionToken } from '@angular/core';

export const AVATAR_ACCESSOR = new InjectionToken('AVATAR_ACCESSOR');
export type AvatarPresenceIndicator = 'online' | 'offline' | 'away' | null | string;
export type AvatarPreset = 'identicon' | 'initials' | '' | string;
export type AvatarKey = string | number | null | undefined;
export type AvatarVariant = 'solid' | 'tonal' | 'outlined' | 'plain' | string;
