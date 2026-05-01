import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsPrefix]',
})
export class Prefix {}

@Directive({
  selector: '[ngsTextPrefix]',
})
export class TextPrefix {}

@Directive({
  selector: '[ngsIconPrefix]',
})
export class IconPrefix {}

@Directive({
  selector: '[ngsIconButtonPrefix]',
})
export class IconButtonPrefix {}

@Directive({
  selector: '[ngsSuffix]',
})
export class Suffix {}

@Directive({
  selector: '[ngsTextSuffix]',
})
export class TextSuffix {}

@Directive({
  selector: '[ngsIconSuffix]',
})
export class IconSuffix {}

@Directive({
  selector: '[ngsIconButtonSuffix]',
})
export class IconButtonSuffix {}
