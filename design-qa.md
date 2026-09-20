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
