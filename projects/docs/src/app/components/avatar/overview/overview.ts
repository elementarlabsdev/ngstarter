import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicAvatarExample } from '../_examples/basic-avatar-example/basic-avatar-example';
import { AvatarSizesExample } from '../_examples/avatar-sizes-example/avatar-sizes-example';
import {
  AvatarWithImagesExample
} from '../_examples/avatar-with-images-example/avatar-with-images-example';
import {
  AvatarWithIconsExample
} from '../_examples/avatar-with-icons-example/avatar-with-icons-example';
import { GroupedAvatarsExample } from '../_examples/grouped-avatars-example/grouped-avatars-example';
import {
  GroupedAndTotalAvatarsExample
} from '../_examples/grouped-and-total-avatars-example/grouped-and-total-avatars-example';
import {
  AvatarPresenceIndicatorExample
} from '../_examples/avatar-presence-indicator-example/avatar-presence-indicator-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  AvatarAutomaticColorExample
} from '../_examples/avatar-automatic-color-example/avatar-automatic-color-example';
import { AvatarDicebearExample } from '../_examples/avatar-dicebear-example/avatar-dicebear-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { AvatarVariantsExample } from '../_examples/avatar-variants-example/avatar-variants-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicAvatarExample,
    AvatarVariantsExample,
    AvatarSizesExample,
    AvatarWithImagesExample,
    AvatarWithIconsExample,
    GroupedAvatarsExample,
    GroupedAndTotalAvatarsExample,
    AvatarPresenceIndicatorExample,
    Page,
    PageContentDirective,
    AvatarAutomaticColorExample,
    AvatarDicebearExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
