import { Component } from '@angular/core';
import { Alert, AlertIconDirective, AlertTitleDirective } from '@ngstarter-ui/components/alert';
import { AvatarGroup, Dicebear } from '@ngstarter-ui/components/avatar';
import { Badge } from '@ngstarter-ui/components/badge';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Chip, ChipListbox, ChipOption, ChipSet } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import { Kbd, KbdGroup } from '@ngstarter-ui/components/kbd';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { NativeTable } from '@ngstarter-ui/components/table';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    Alert,
    AlertIconDirective,
    AlertTitleDirective,
    AvatarGroup,
    Badge,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    ChipListbox,
    ChipOption,
    ChipSet,
    Dicebear,
    Icon,
    Kbd,
    KbdGroup,
    NativeTable,
    ProgressBar,
    SlideToggle,
    Tab,
    TabGroup,
  ],
  templateUrl: './preview.component.html'
})
export class PreviewComponent {}
