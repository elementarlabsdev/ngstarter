import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Alert, AlertIconDirective, AlertTitleDirective } from '@ngstarter-ui/components/alert';
import { Badge } from '@ngstarter-ui/components/badge';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardActions, CardContent, CardHeader, CardSubtitle, CardTitle } from '@ngstarter-ui/components/card';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { NgsThemeName, ThemeManagerService } from '@ngstarter-ui/components/core';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Menu, MenuDivider, MenuHeading, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Select, Option } from '@ngstarter-ui/components/select';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { NativeTable } from '@ngstarter-ui/components/table';

type SchemeName = 'light' | 'dark' | 'auto';

@Component({
  imports: [
    Page,
    PageTitleDirective,
    Alert,
    AlertIconDirective,
    AlertTitleDirective,
    Badge,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Checkbox,
    FormField,
    Hint,
    Icon,
    Input,
    Label,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuItem,
    MenuTrigger,
    NativeTable,
    Option,
    Select,
    SlideToggle,
  ],
  templateUrl: './playground.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './playground.scss'
})
export class ThemePlayground {
  private readonly themeManager = inject(ThemeManagerService);

  readonly theme = this.themeManager.theme;
  readonly colorScheme = this.themeManager.selectedColorScheme;

  readonly themes: ReadonlyArray<{ value: NgsThemeName; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'chalk', label: 'Chalk' },
  ];
  readonly schemes: SchemeName[] = ['light', 'dark', 'auto'];

  setTheme(theme: NgsThemeName): void {
    this.themeManager.setTheme(theme);
  }

  setColorScheme(colorScheme: SchemeName): void {
    this.themeManager.setColorScheme(colorScheme);
  }
}
