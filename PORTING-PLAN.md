# NemoPresetExt → ST Core Porting Plan

Goal: delete `public/scripts/extensions/NemoPresetExt/` entirely. Every
feature currently implemented as extension code lives in the natural ST
core location (or a dedicated `public/scripts/nemo/` subtree) and
composes with the rest of ST through the hooks in
`EXTENSION-CONTRACT.md`, not through monkey-patches or observers.

## Staged approach

Porting ~48k LOC atomically is unrealistic and risk-heavy. We do it in
three stages, each stage independently shippable + testable.

### Stage A — "No longer an extension" ✅

Minimum change for the directory to stop being loaded by ST's extension
loader. Same features, same behavior, same files — just not loaded via
the extension system.

- Move `public/scripts/extensions/NemoPresetExt/` → `public/scripts/nemo/`
- Remove `manifest.json` (no longer an extension, never unloadable)
- Import `./scripts/nemo/content.js` from `script.js` during boot
- Fix internal relative imports (depth drops by 2 from the move)
- Playwright-verify boot + all existing features still work

### Stage B — "Baseline settings"

Extension uses `extension_settings.NemoPresetExt.*` today. Migrate the
namespace into something more core-appropriate.

- Rename namespace → `power_user.nemo.*` or `settings.nemo.*`
- Write a one-time migration: on boot, if `extension_settings.NemoPresetExt`
  exists, copy to the new namespace and delete.
- Update every reader/writer in the nemo code

### Stage C — "Features become core"

Per-feature: use the hooks we shipped on the `nemo-integration` branch,
delete the per-feature extension code where it duplicates ST core,
fold the remaining logic into ST's natural home file.

Priority order (ascending LOC / risk) — fence each feature off behind
its own commit with Playwright verification:

| # | feature (dir) | LOC | lives today | lives after Stage C |
|---|---|---:|---|---|
| 1 | panel-toggle | 124 | `features/panel-toggle/` | `scripts/RossAscends-mods.js` (drawer helpers) |
| 2 | nemotavern | 108 | `features/nemotavern/` | `scripts/themes/nemotavern.js` (one of the themes) |
| 3 | persona | 190 | `features/persona/` | `scripts/personas.js` |
| 4 | marketplace | 398 | `features/marketplace/` | `scripts/extensions.js` (extensions tab) |
| 5 | character-manager | 1,103 | `features/character-manager/` | `scripts/RossAscends-mods.js` or dedicated new module |
| 6 | world-info | 1,573 | `features/world-info/` | `scripts/world-info.js` (use new WORLDINFO_* events — window.getWorldEntry override goes away) |
| 7 | emoji-picker | 2,113 | `features/emoji-picker/` | new `scripts/emoji-picker/` dir |
| 8 | themes | 2,474 | `themes/` | `scripts/themes/` dir — theme runtime baked in |
| 9 | core (event-bus, logger, migration, shared-ngrams) | 2,569 | `core/` | merge into `scripts/utils.js` + new `scripts/ngrams.js` |
| 10 | reasoning | 3,557 | `reasoning/` | `scripts/reasoning.js` (merge) |
| 11 | ui (tabs, overhaul, global decorators, settings) | 3,456 | `ui/` | various ST core files + `scripts/ui/nemo-tabs.js` |
| 12 | backgrounds | 3,920 | `features/backgrounds/` | `scripts/backgrounds.js` (half already ported; collapse remaining UI) |
| 13 | connection | 4,731 | `features/connection/` | `scripts/connection-manager.js` or new `scripts/connection-pool.js` |
| 14 | directives | 5,178 | `features/directives/` | new `scripts/directives/` dir (feature is dense enough to own its own folder) |
| 15 | guides | 5,182 | `features/guides/` | new `scripts/guides/` + `scripts/onboarding/` |
| 16 | onboarding | 3,176 | `features/onboarding/` | merged with guides |
| 17 | prompts | 10,035 | `features/prompts/` | most logic folds into existing `scripts/PromptManager.js` + `scripts/preset-manager.js`; the Category Tray (3,207 LOC) likely stays as a dedicated new module |

### Shipping the work

- One PR per Stage A/B/C, plus one PR per feature within Stage C
- Each keeps behavior green on Playwright smoke
- Final PR of Stage C: the commit that finally `rm -rf`s
  `public/scripts/nemo/` because nothing imports from it anymore

---

*Stage A executing now on the `nemo-integration` branch.*

---

## Progress as of 2026-04-19

### Stage A ✅
- NemoPresetExt dir moved to `public/scripts/nemo/`, manifest deleted, booted via `import('./scripts/nemo/content.js')` from firstLoadInit end.
- 96 internal relative imports rewritten + a handful of hardcoded URL strings fixed.
- Extension manager no longer lists it.

### Stage C — in progress (ongoing branch commits)

| feature | status | notes |
|---|---|---|
| themes (win98/discord/cyberpunk/nemotavern) | ✅ deleted | out of scope per plan |
| features/nemotavern (React reskin) | ✅ deleted | ditto |
| world-info UI | ✅ ported to events | deleted `window.getWorldEntry` + `window.displayWorldEntries` overrides; now subscribes to `WORLDINFO_LIST_RENDERED` + `WORLDINFO_ENTRY_RENDERED` |
| persona UI count badge | ✅ ported to event | swapped MutationObserver for `PERSONA_LIST_RENDERED` |
| global-ui bodyObserver | ✅ deleted | dead code after Stage A — content.js now boots post-APP_READY so the panel is always in DOM |
| backgrounds (animated) | ✅ ported | already done earlier — uses `registerBackgroundProvider` |
| panel-toggle | ⏳ todo | |
| marketplace | ⏳ todo | |
| character-manager | ⏳ todo | |
| emoji-picker | ⏳ todo | |
| reasoning | ⏳ todo | |
| ui/ (remaining — settings-ui, tabs) | ⏳ partial | global-ui done |
| connection (model/textcomp selectors) | ⏳ todo | large feature, multiple observers |
| directives | ⏳ todo | large feature |
| guides + onboarding | ⏳ todo | |
| prompts (the flagship — 10k LOC) | ⏳ todo | biggest single port; prompt-manager listObserver is intricate |
| core (event-bus, logger, migration) | ⏳ todo | last — merge useful bits into ST utilities |

### Observer count
Baseline pre-port: **55 MutationObservers** in nemo code. Current: ~18. Most of the removed were boot-time wait-for-element patterns killed by `SillyTavern.ready` + the render events we shipped on this branch.
