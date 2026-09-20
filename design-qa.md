# Notifications design QA

- Source visual truth: `/Users/developer/.codex/generated_images/01a08b3f-4edd-79d0-9997-c9ed45703794/exec-f8e6f63b-daaa-474c-aea6-dbf6e5ca98a3.png`
- Implementation: `http://localhost:4200/components/notifications`
- Implementation screenshot: Codex in-app browser capture from tab 2, inspected inline during this task; the browser API did not persist the capture as a workspace file.
- Viewport: 1440 × 1000 CSS px, device scale factor 1.
- Source pixels: 1418 × 1109 px. The implementation was reviewed as an 818 px-wide focused component region inside the docs page; no density resampling was required.
- State: light theme; default, unread, rich-content, hover/focus controls, and open action menu.

## Full-view comparison evidence

The implementation uses the selected flat activity-list direction: compact avatar-led rows, plain secondary content, time aligned in the upper-right corner, inset dividers, a restrained unread dot, and a neutral hover surface. The docs examples no longer render large independent cards or input-like content boxes. Rich variants retain their buttons, chips, and task metadata within the same row anatomy.

## Focused region comparison evidence

The `Notification list` example was inspected at 818 px width in both default and hover states. The timestamp remains in the upper-right metadata column while the absolutely positioned action control appears in its permanently reserved end slot. Comparing the two browser captures confirms that the message, timestamp, and row dividers do not move. The menu opened from the revealed control and exposed both actions.

## Required fidelity surfaces

- Fonts and typography: existing NgStarter font stack retained; actor weight, 14 px message hierarchy, 12 px time metadata, wrapping, and antialiasing match the library and the reference direction.
- Spacing and layout rhythm: 12 px vertical and 16 px horizontal row padding, 12 px avatar gap, compact content margins, inset dividers, a stable upper-right metadata column, and 40 px avatars create a consistent dense feed. Rich rows expand only for their actions or metadata.
- Colors and visual tokens: all surfaces and states use existing `--ngs-*` semantic tokens. Hover is neutral gray, unread uses the cobalt primary dot without a full primary tint, and destructive content uses danger tokens.
- Image and icon fidelity: real project avatar assets and Fluent icons are used. Semantic icon containers use theme tokens and remain sharp at component scale.
- Copy and content: basic, rich, unread, destructive, list, and menu-action examples render their intended content without clipped or merged labels.

## Comparison history

1. Initial implementation review found two P2 issues: the destructive example merged adjacent labels, and semantic icon color could disappear against its container.
2. Added explicit inline spacing around the destructive action and bound semantic icon colors through `--ngs-icon-color` plus danger/success/warning/info tokens.
3. Post-fix review showed correct destructive spacing and semantic containers. The hover check confirmed zero layout shift; the action menu opened correctly. No actionable P0, P1, or P2 issues remain.
4. Moved time into a dedicated upper-right grid column and rechecked default and hover states. The action button remains overlaid in its reserved slot without moving the timestamp or content.

## Findings

No actionable P0, P1, or P2 differences remain. The implementation intentionally uses the project’s real avatars and Fluent icons instead of the generated mock’s illustrative pixel avatar.

## Open questions

None.

## Implementation checklist

- [x] Compact row layout and inset separators
- [x] Plain secondary content without nested field styling
- [x] Unread dot using primary token
- [x] Destructive state using danger tokens
- [x] Hover/focus action reveal without layout shift
- [x] Rich variants aligned to the same component anatomy
- [x] Action menu interaction and console checked

## Follow-up polish

None required for the selected direction.

final result: passed

---

# Chalk theme design QA

- Source visual truth: `/var/folders/1d/fz5by63d34q8vxjmjfdxdz4h0000gn/T/codex-clipboard-8b6f131c-8eb8-45dc-9a4b-b538718ee340.png`
- Implementation: `http://127.0.0.1:4200/theme/playground`
- Implementation screenshot: Codex in-app browser capture from tab 1, inspected inline during this task; the browser API did not persist the capture as a workspace file.
- Viewport: 1280 × 720 CSS px, device scale factor 1.
- Source pixels: 1488 × 1026 px. Implementation pixels: 1280 × 720 px. The mock and playground contain different content layouts, so comparison was normalized to component-scale surfaces rather than full-screen geometry.
- State: Chalk theme, explicit light scheme; default controls, focused text field, table, and open action menu.

## Full-view comparison evidence

The rendered playground reproduces the selected Chalk art direction: a warm-white canvas, near-black graphite typography, restrained neutral supporting text, fine gray rules, compact square geometry, and a single chartreuse accent. The documentation shell remains intentionally different from the component-workshop mock because this change is a reusable theme, not a recreation of the mock screen.

## Focused region comparison evidence

Actions and form controls were inspected together for surface color, border weight, corner radius, typography, selection, checkbox, toggle, and field focus. The focused email field uses the graphite focus line from the Chalk palette so it stays visible on the warm-white surface. The lower data surface and open menu were then inspected for row rules, neutral elevation, square overlay geometry, disabled content, and accent consistency.

## Required fidelity surfaces

- Fonts and typography: the existing NgStarter DM Sans/system stack is retained; graphite foregrounds, regular body weights, compact labels, and strong headings follow the reference hierarchy without introducing a new font dependency.
- Spacing and layout rhythm: component sizing remains compatible with the library, while all work-surface radii resolve to 2–4 px and shadows remain restrained. Circular controls such as the toggle thumb keep their required shape.
- Colors and visual tokens: the palette is sampled from the reference direction—`#fbfaf9` warm white, `#11110f` graphite, `#d0d0d2` rules, and `#edf16e` chartreuse. Active text, icons, tabs, radio controls, and focus lines use graphite, while chartreuse is reserved for fills. Semantic danger, info, success, and warning colors are preserved.
- Image quality and asset fidelity: the theme introduces no raster or decorative assets. Existing Fluent icons remain sharp and inherit the revised semantic colors.
- Copy and content: playground copy remains unchanged and readable. The reference copy is not duplicated because the target is the theme token system rather than the mock page content.

## Comparison history

1. Initial post-implementation comparison found no actionable P0, P1, or P2 mismatch in the themed component surfaces.
2. Focus, table, and open-menu states were inspected separately; no additional blocking visual drift was found.
3. Follow-up screenshots exposed low contrast where chartreuse was used directly as text and icon color. The semantic roles were split: graphite is used for active text, icons, lines, and radio controls, while chartreuse remains the filled accent. Graphite on chartreuse measures 15.67:1. The sidebar heading, selected Components row, badge, arrow, active Overview tab, and checked radio were rechecked in the browser.

## Findings

No actionable P0, P1, or P2 differences remain for the light Chalk theme. The different page composition is an intentional scope boundary: the approved mock defines the visual language, while the existing playground supplies real library components for verification.

## Open questions

None for the approved light direction. The dark scheme has no matching source visual and was retained only as a compatible explicit consumer option.

## Implementation checklist

- [x] Warm-white business surfaces
- [x] Graphite text and calm neutral hierarchy
- [x] Chartreuse filled, selected, checked, and focused states
- [x] Graphite text, active icons, tab labels, radio controls, and focus lines meet contrast targets
- [x] Minimal 2–4 px corner geometry
- [x] Fine table, card, field, and overlay borders
- [x] Focused field and open menu visually inspected
- [x] Browser console checked with no errors

## Follow-up polish

None required for the selected light direction.

final result: passed
