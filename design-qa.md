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


---

# Content Editor Carousel design QA — 2026-10-03

**Findings**

No actionable P0/P1/P2 findings remain after the final comparison. The library's existing DM Sans font, regular field labels, semantic outline colors, and theme radii are intentional adaptations of the mock. The demo retains its two real project images and existing captions/alt descriptions; the reference illustrates three images with different copy.

**Evidence**

- Source visual truth: `/Users/developer/.codex/generated_images/01a0fded-01bd-74f2-acae-57a18c11deaf/exec-a4a6036e-4e52-4178-82d1-f9ef2118afba.png`.
- Implementation: `http://127.0.0.1:4318/libraries/content-editor/content-builder`.
- Final implementation: `/Users/developer/.codex/visualizations/2026/10/02/01a0fded-01bd-74f2-acae-57a18c11deaf/carousel/carousel-implementation.png`.
- Combined final comparison: `/Users/developer/.codex/visualizations/2026/10/02/01a0fded-01bd-74f2-acae-57a18c11deaf/carousel/carousel-comparison.png`.
- Surrounding docs context: same directory, `carousel-context.png`.
- Mobile evidence: same directory, `carousel-mobile.png`.
- Viewports: default desktop 1280 × 720; responsive checks at 800 × 720 and 390 × 720 CSS px, device scale factor 1. Temporary overrides reset.
- Source: 1254 × 1254 pixels, component crop 1063 × 1119 normalized to 704 × 741. Implementation component: 704 × 776.875 CSS px, captured as 704 × 777 pixels by joining two overlapping real browser captures. No CSS resizing was used to fit the block into a screenshot.
- State: light theme, first image selected, fields unfocused; additional selected-thumbnail, field editing, action menu, replacement upload, drag, undo and image-viewer states inspected.

**Full-view comparison evidence**

The source and implementation are displayed together in `carousel-comparison.png`. Both use one outlined surface with a title/count and Add images action, a large preview with overlaid navigation and counter, the reorder helper directly above a filmstrip below the preview, then ordinary Caption and Alt text fields. No Grid controls or per-image inline rich-text editors are present.

**Focused region comparison evidence**

The same comparison is readable at 704 px per component. The helper/filmstrip and fields were specifically inspected: thumbnails now use 128 × 72 image previews, selection is outlined in primary blue, a distinct drag handle avoids accidental dragging while selecting, and the caption's unused subscript area has been removed. Alt retains the screen-reader hint. Overlay navigation stays inside the preview.

**Required fidelity surfaces**

- Fonts/typography: existing DM Sans/system stack, 16 px semibold title and regular library field/body typography retained. Caption and alt are single-line inputs; long input text scrolls normally instead of expanding the block.
- Spacing/layout rhythm: 16 px desktop padding, 12 px compact padding, 16:9 preview, 16 px main gaps, and a compact consecutive field pair. The slightly taller implementation accommodates actual NgStarter control metrics.
- Colors/tokens: surface, outline, primary selection/action, and on-surface colors use existing semantic tokens. The preview counter remains dark with white text; focused inputs retain the library's primary outline.
- Image quality/assets: existing project photographs and Fluent icons retained. Images use object-fit cover in previews and thumbnails, with the existing ImageViewer available for full inspection. Different supplementary photos in the generated reference are illustrative content rather than new required assets.
- Copy/content: Carousel, Add images, Drag to reorder, Caption, Alt text, and Describe the image for screen readers match the selected flow. Caption/alt content belongs to each selected image.

**Comparison history**

1. Initial implementation review found preview actions displaced below the image by Button's host positioning. Explicit absolute positioning restored the overlaid navigation/menu; reviewed in the browser before the first saved combined comparison.
2. The first combined comparison (`ngs-carousel-redesign-comparison-before.png` in the evidence directory) found P2 gaps: an unused caption subscript area separated the two fields, and undersized thumbnails made the filmstrip denser than the selected design. Removed empty subscript space and increased thumbnail/Add tile widths. The preview menu also received a rounded-square theme radius. Final combined evidence shows the corrected field spacing and thumbnail scale.
3. At 390 px, the flex item's automatic minimum width stretched the block beyond the viewport (P2). Added `min-width: 0` to the builder's block-content flex item. Final mobile evidence shows a 259 px block with clientWidth/scrollWidth both 257 px, and a 233 px filmstrip viewport with independently scrollable 488 px content. Preview, Add action and fields fit inside the block.
4. Rebuilt both targets, recaptured the desktop at its original viewport, and compared the final source/implementation together. No actionable P0/P1/P2 findings remain.

**Interaction and validation evidence**

17 targeted tests pass across extra-blocks and content-editor-renderer. Tests cover selected-image caption/alt updates, reorder selection stability, root history, replacement preservation, cancelled uploads and removal during an upload. Browser checks cover thumbnail selection, input updates, keyboard undo, pointer drag/reorder, replacement through the preview menu and image viewer. Console error log is empty. Production component and docs builds pass.

**Open Questions**

None. The reference has no empty/uploading/error or dark-theme visual target; those use existing NgStarter UploadArea, ProgressBar, Alert, and theme tokens. Empty/upload race handling is covered by tests.

**Implementation Checklist**

- [x] Preview with overlaid navigation, counter and image menu
- [x] Filmstrip below preview; Drag to reorder label above thumbnails
- [x] Stable selection when reordering/removing images
- [x] Ordinary per-image Caption and Alt text inputs
- [x] Add, replace, remove, accessible menu reorder, and root undo/redo
- [x] Mobile fitting and independent thumbnail scrolling
- [x] Source/implementation combined comparison and console check
- [x] 17 tests and both production builds

**Follow-up Polish**

No required polish remains. Existing theme-dependent font, border and corner metrics are accepted library adaptations.

final result: passed
