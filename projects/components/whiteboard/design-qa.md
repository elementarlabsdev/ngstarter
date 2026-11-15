# Whiteboard visual verification

final result: passed

## Evidence

- Source: `/Users/developer/.codex/generated_images/01a1acb2-8070-7392-873e-7163f5e9b7b4/exec-9224138c-c4be-47a8-a023-6798d74a5b2b.png` (first design).
- Implementation: `http://127.0.0.1:4201/components/whiteboard/demo` (production build, no hot reload).
- Desktop (English): `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-english.png`.
- Mobile: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-default-mobile.png`.
- Full comparison: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-default-comparison.png`.
- Focused controls comparison: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-default-detail-comparison.png`.

Both source and desktop capture are 1623 × 969 pixels, with a matching CSS viewport and no density stretching. The earlier full and focused comparisons document the layout correction before the English copy update. State: Default/light, pencil selected, properties open, 80% opacity, normal pressure mode, 100% zoom. Mobile was checked at 390 × 844 with controls visible, and with properties closed/content fitted. The temporary viewport override was reset afterwards. The mobile evidence predates the English copy update.

## Findings and corrections

The previous pass was reopened following user feedback. The documentation shell, inherited Chalk theme and smaller control geometry were material differences. The user subsequently clarified that the interface and example content should be in English; the reference now guides visual structure, with English copy taking precedence.

1. Removed documentation navigation/header from the fullscreen demo while keeping its route outlet stable. The component still has its normal embedded documentation example.
2. Applied Default/light in the demo, and switched the running documentation UI to Default through its theme controls. Browser DOM confirmed `data-ngs-theme="default"`.
3. Matched the top toolbar to 760 × 72 at x439.5/y16, and the properties card to 280 × 509 at x24/y112. Restored title/subtitle, detached export/more actions, rounded control geometry, colors, grid, shadows, stroke/style controls, opacity and pressure selector.
4. Added localized labels, editable example content, a loaded handwriting font, tool locking and actual pen-pressure rendering. Corrected the card close-button slot, full-width pressure choices and horizontal dashed-line icon. The demo uses English controls, subtitle and canvas labels, matching the library's default locale.
5. Fixed mobile palette wrapping and verified that the floating tools scroll horizontally and the canvas fits its content.
6. Fixed Konva DOM removal during Angular template updates. The existing stage is reattached after rendering, preserving its document/history. A browser regression test now covers this case. A cold production launch showed two live canvases and loaded example objects.

## Fidelity surfaces

- Typography: actual kit font/weights and readable 14px controls. The illustrative English handwritten heading uses loaded Caveat.
- Layout: same viewport, floating regions, panel positions, sizes and diagram coordinates as the source. Both full-view and focused comparisons were inspected together.
- Tokens: actual Default palette and component tokens; no inherited yellow accent. Existing ColorSwitcher received optional styling tokens with unchanged defaults for other consumers.
- Assets: existing Fluent icons and NgStarter controls. All diagram content is editable Konva data, not a screenshot substitute.
- Copy: English subtitle, property labels, actions, hints and example labels follow the user's explicit language correction.

No remaining P0/P1/P2 issues were observed in the checked states. P3 differences remain in the generated mock's unidentifiable handwriting/icon details and the exact shape of illustrative freehand paths. This is not a pixel-identical raster recreation.

## Validation

- 19 Chromium tests passed, including pressure, JSON, history, readonly behavior, zoom/export invariance, Angular signals and canvas DOM restoration.
- Production component build, production documentation build, package verification and whitespace checks passed.
- Manually tested pressure mode, tool locking/unlocking, rectangle creation and automatic return to selection, undo, mobile fit and viewport resizing.
- Cold production launch: Default theme, two canvases, custom font loaded, example visible; browser warnings/errors empty.
- English correction: documentation production build and whitespace checks passed. Browser confirmed English controls and example labels, no Cyrillic in Whiteboard DOM, two canvases, loaded Caveat and the retained Default theme.

## Selection handle refinement

Following the user's selection screenshot, handles became circles centered on the selection outline, with no padding. Only four corner resize handles and the rotation handle remain. Konva's Transformer uses screen coordinates, so the previous inverse-zoom sizing was removed; controls stay the same size when zooming out. A larger invisible hit area keeps the handles usable. The initial 6px diameter was increased to 10px after the user found it too small.

- Browser checked selection at 100%, 23% and 120%, then restored 100%. Resizing and rotation worked; both temporary edits were undone.
- Detail: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-round-handles-detail.png`.
- Full context: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-round-handles.png`.
- Low zoom: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-round-handles-zoomed-out.png`.
- Component and documentation production builds passed; all 19 Whiteboard Chromium tests passed.
- 10px follow-up: both production builds passed and the larger circular handles were checked in the browser at 100%. Current detail: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-handles-10-detail.png`; full context: `/Users/developer/.codex/visualizations/2026/11/05/01a1acb2-8070-7392-873e-7163f5e9b7b4/whiteboard-handles-10.png`.
