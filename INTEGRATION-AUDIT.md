# NemoPresetExt → ST Integration Audit

Inventory of every hacky pattern NemoPresetExt relies on, ranked by how
badly ST core forces the hack. Fixing these in ST core = the extension
can drop the workaround; ideally the feature becomes baseline.

## Scale of the problem

- **55** `MutationObserver` instances across 10 extension files
- **208** `setTimeout` / `setInterval` calls (most are polling, not scheduling)
- **511** distinct hardcoded ST CSS selectors
- **14** named race-condition delay constants (`OBSERVER_INIT_DELAY: 500`, `PRESET_LOAD_POLL_INTERVAL: 50`, etc.)
- Imports reaching **6 levels deep** into ST internals (`../../../../../../script.js`)
- **5** direct monkey-patches of `window.<fn>` ST globals

---

## Hack #1 — Monkey-patching ST globals

The extension overrides ST's own top-level functions by reassigning globals.

| Override | File | Why it was needed |
|---|---|---|
| `window.setBackground = …` | `features/backgrounds/animated-backgrounds.js:298, 601` | ST's background setter can't handle video/animated media; extension wraps it to add media-type handling |
| `window.getMediaType = …` | `.../animated-backgrounds-module.js:583` | ST has no media-type classifier; extension injects one as a global |
| `window.onYouTubeIframeAPIReady = …` | `.../animated-backgrounds-module.js:169` | YouTube IFrame API callback — single global slot, must be taken over |
| `window.getWorldEntry = …` | `features/world-info/world-info-ui.js:791` | ST renders world-info entries with no hook; extension replaces the function entirely |
| `window.displayWorldEntries = …` | `features/world-info/world-info-ui.js:797` | Same reason — the only way to decorate the WI panel is to replace the top-level render fn |

**What ST core should add:**
- Export `setBackground` / `getMediaType` from a module instead of hanging on `window`
- Emit a `mediaType: 'video' | 'image' | 'youtube' | ...` on background load, let extensions provide handlers via registration
- First-class hook points for world-info entry rendering (`on('worldinfo:entryRender', fn)` that lets extensions decorate without swap)

---

## Hack #2 — 55 MutationObservers watching ST DOM

Because ST doesn't emit events when its UI rebuilds itself, the extension has to *watch the DOM* to know when to re-apply its enhancements. Examples:

- `ui/global-ui.js:45` — watching for visibility changes on ST panels (no event)
- `ui/global-ui.js:160` — watching for panel creation to convert them (no event)
- `features/directives/directive-ui.js:475` — watching to re-bind directive UI after ST re-renders prompt list (no event)
- `features/directives/directive-autocomplete-ui.js:45` — waiting for autocomplete DOM to appear (no ready signal)
- `ui/extensions-tab-overhaul.js:181` — watching to dedupe ST's own duplicate elements (ST bug workaround)

Every observer is a race, a memory-leak risk, and a performance tax.

**What ST core should add:**

A first-class event bus with these events (at minimum):
- `promptList:rendered`
- `preset:changed` / `preset:loaded`
- `persona:changed`
- `worldinfo:listRendered` / `worldinfo:entryRendered` / `worldinfo:entryUpdated`
- `panel:shown` / `panel:hidden`
- `chat:messageRendered`
- `ui:ready` (replaces the `OBSERVER_INIT_DELAY: 500` voodoo)
- `autocomplete:opened`

ST partially has this via `eventSource` in `script.js` but coverage is sparse and undocumented.

---

## Hack #3 — 208 `setTimeout` / `setInterval` calls, much of it polling

Extension polls ST state because events either don't exist or fire too early. Named poll constants acknowledge this:

```js
DEBOUNCE_DELAY: 300,
OBSERVER_INIT_DELAY: 500,
UI_REFRESH_DELAY: 500,
DOM_SETTLE_DELAY: 50,
UI_UPDATE_DELAY: 100,
TOGGLE_BATCH_DELAY: 50,
PRESET_LOAD_POLL_INTERVAL: 50,
REQUEST_TIMEOUT: 10000,
RETRY_ATTEMPTS: 3,
RETRY_DELAY: 1000,
```

Every `DELAY` constant is an admission "I don't know when ST is done, so I'll wait".

**What ST core should add:**
- Promises for async state transitions (preset load, persona load, chat switch) so extensions can `await` instead of poll
- A documented `STReady.promise` that resolves once the app finishes boot — kill `OBSERVER_INIT_DELAY: 500`

---

## Hack #4 — 511 hardcoded CSS selectors as the public contract

Every feature couples to ST selectors. Examples:
- `#completion_prompt_manager_list` (prompt list container)
- `.completion_prompt_manager_prompt_enabled`
- `#WorldInfo` / `.world_entry`
- `#background_menu` / `.bg_example`
- `#rm_button_selected_ch`

When ST renames a class, extension breaks silently. There is no "extension API selector contract" in ST.

**What ST core should add:**
- `data-*` attributes as the stable contract, not class names
  - `data-st-role="prompt-list"` / `data-st-role="prompt-item"` / etc.
- Or: a documented element-query registry (`ST.ui.getPromptList()`, returns the element)

Short-term: pin a selector contract as a `SELECTORS.md` doc in ST core so both sides know what's stable.

---

## Hack #5 — Deep relative imports into ST internals

Extension imports from 6 levels up (`../../../../../../script.js`), touching:

```
script.js, openai.js, extensions.js, utils.js, popup.js,
secrets.js, tokenizers.js, tool-calling.js, reasoning.js,
world-info.js, scripts/util/AccountStorage.js
```

Every one of these is the extension reaching into ST's private implementation. Upgrading ST = extension breaks.

**What ST core should add:**
- A `public/scripts/extension-api.js` module that re-exports the *stable* pieces extensions are allowed to import. Mark everything else as internal.
- Version the API. Extensions declare `"requires": { "api": ">=2.0.0" }` in manifest.

---

## Hack #6 — `script.js` god file

Not the extension's fault, but *because* `script.js` is 12,505 lines / 222 functions / 218 exports, the extension has no sane way to patch individual behaviors — it either monkey-patches the global (Hack #1) or re-implements via observer (Hack #2). Splitting `script.js` into concern-modules is a prerequisite for proper extension hooks.

Suggested split (stable export surface preserved):
1. `core/lifecycle.js` — `firstLoadInit`, `doOnboarding`, `reloadLoop`, `fixViewport`
2. `core/chat-lifecycle.js` — `delChat`, `renamePastChats`, `getChatResult`, `getFirstMessage`
3. `core/character-loader.js` — `read_avatar_load`, `getCharacterBlock`, `getHiddenBlock`, `verifyCharactersSearchSortRule`
4. `core/message-generation.js` — `doChatInject`, `flushWIInjections`, `unblockGeneration`, `formatMessageHistoryItem`
5. `core/message-render.js` — `getMessageTextHTML`, `insertSVGIcon`, `cleanGroupMessage`, `removeLastMessage`
6. `core/extension-prompts.js` — `addPersonaDescriptionExtensionPrompt`, `getAllExtensionPrompts`
7. `core/response-handling.js` — `extractTitleFromData`, `extractImagesFromData`, `extractMultiSwipes`, `parseAndSaveLogprobs`, `processImageAttachment`, `saveImageToMessage`
8. `core/token-accounting.js` — `parseTokenCounts`, `formatGenerationTimer`, `setInContextMessages`
9. `core/send-string.js` — `addChatsPreamble`, `addChatsSeparator`
10. `core/version.js` — `getClientVersion`, `initStandaloneMode`
11. `core/ui-stubs.js` — `showStopButton`, `hideStopButton`, `updateMessageItemizedPromptButton`
12. `core/empty-states.js` — `getBackBlock`, `getEmptyBlock`

Each < 1000 lines. `script.js` stays as a re-export barrel so the 52 dependent files don't move. First PR.

---

## Prioritized action list

Ranked by ratio of (pain removed) / (ST-core surgery required):

| # | Action | Effort | Removes hack |
|---|---|---|---|
| 1 | Add `data-st-role` attributes to prompt list, world-info entries, background menu, persona panel | 2h | 150+ selector couplings |
| 2 | Document + expand `eventSource` with `promptList:rendered`, `preset:changed`, `worldinfo:entryRendered`, `panel:shown` | 4h | 30+ MutationObservers |
| 3 | Add `ST.ready` promise + `'app:ready'` event | 1h | `OBSERVER_INIT_DELAY: 500` + 5 other delay constants |
| 4 | Export `setBackground` / `getMediaType` from a module + add a `backgroundProvider` registration API | 3h | 3 global monkey-patches, 50 LOC of wrapper code |
| 5 | Hook point for world-info entry rendering | 3h | 2 global monkey-patches, biggest extension file (`world-info-ui.js`) simplifies massively |
| 6 | Split `script.js` into 12 concern-modules (barrel stays) | 1 day | Prerequisite for cleaner hook points |
| 7 | Build `extension-api.js` re-export + version manifest | 4h | All deep relative imports |
| 8 | Author `SELECTORS.md` contract | 1h | Communication hack, not code |

**Do #1 + #2 + #3 first.** They unblock most of the extension's workarounds with ~7h of ST-core work, all backward-compatible.

---

*Generated from scan of NemoPresetExt v4.7.0 against ST staging @ 767746beb.*

---

## Progress scoreboard (updated live as `nemo-integration` advances)

| # | Action | Status | Commits |
|---|---|---|---|
| 1 | `data-st-role` attributes (prompt list, WI, personas, chat, backgrounds) | ✅ shipped | `feat(prompt-manager)`, `feat(world-info)`, `feat(personas)`, `feat(chat)` |
| 2 | Expand `eventSource` with render-complete events | ✅ partial — prompt list, WI entry+list, persona list, panel shown/hidden, prompt toggle, background changed; still missing: autocomplete, chat submit | 6 commits |
| 3 | `SillyTavern.ready` promise + `APP_READY` event | ✅ shipped | `feat(events): SillyTavern.ready` |
| 4 | `setBackground` / `getMediaType` module exports + `registerBackgroundProvider` API | ✅ shipped | `feat(backgrounds)` |
| 5 | WI entry rendering hook | ✅ shipped | `feat(world-info)` |
| 6 | Split `script.js` into concern modules | ⏳ not yet | |
| 7 | `extension-api.js` re-export barrel | ✅ shipped | `feat(api)` — 37 symbols from 12 source modules |
| 8 | Public `EXTENSION-CONTRACT.md` (replaces the planned SELECTORS.md) | ✅ shipped | `docs/EXTENSION-CONTRACT.md` |

### Hacks killed (from NemoPresetExt's monkey-patch + observer pile)

- `window.setBackground = …` (2 copies, both files) ✅
- `window.getMediaType = …` ✅
- `window.getWorldEntry = async function(...)` ✅
- `window.displayWorldEntries = async function(...)` ✅
- `OBSERVER_INIT_DELAY: 500` race ✅
- MutationObserver on `#completion_prompt_manager_list` (full-list watch) ✅ killed; toggle-replacement sub-case ✅ covered by `PROMPT_TOGGLE_CHANGED`
- MutationObserver on `#user_avatar_block` ✅
- MutationObserver on `.openDrawer` / panel visibility ✅ (covered by `PANEL_SHOWN` / `PANEL_HIDDEN`)
- Deep `../../../../script.js` imports ✅ (barrel available; extension migration is a follow-up)

### Still open

- `window.onYouTubeIframeAPIReady` — Google's callback global is unavoidable; extension's wrap-existing pattern is fine
- Full `script.js` split (12,505 LOC → ~12 concern modules)
- Some remaining extension observers (directive-ui, extensions-tab-overhaul, category-tray) waiting on similar per-feature hooks
- Porting the extension's prompt-manager collapsible-sections feature into ST core proper (planned)
