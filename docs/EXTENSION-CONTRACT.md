# SillyTavern extension contract

This document defines the *public* API surface for SillyTavern extensions.
Anything listed here is stable — internal renames that break these break
every extension. Anything NOT listed here is internal and may change
without notice.

## 1. Imports — use the barrel

```js
import {
    eventSource, event_types, appReady, getContext,
    chat, chat_metadata, characters, this_chid, selected_group,
    callGenericPopup, POPUP_TYPE, Popup,
    extension_settings,
    oai_settings, openai_setting_names, model_list, promptManager,
    saveChatDebounced, saveSettingsDebounced, saveMetadata,
    getRequestHeaders, getThumbnailUrl, getCurrentChatId,
    selectCharacterById, generateQuietPrompt,
    secret_state, getTokenCountAsync,
    ToolManager, updateReasoningUI,
    setBackground, registerBackgroundProvider, detectBackgroundMediaType,
    renderTemplate, renderTemplateAsync,
    debounce, escapeHtml, sortIgnoreCaseAndAccents,
} from '../../extension-api.js';
```

Do **not** import from deep paths like `../../../../script.js`. They pin
extensions to ST's exact folder layout and expose internal symbols.

## 2. Global — `window.SillyTavern`

Available after the script tag for `script.js` executes. Fields:

| Field | Type | Notes |
|---|---|---|
| `libs` | object | bundled third-party libraries |
| `getContext` | function | returns the runtime context object |
| `ready` | `Promise<SillyTavern>` | resolves once `APP_READY` fires — `await SillyTavern.ready` replaces the `OBSERVER_INIT_DELAY` dance |
| `eventSource` | EventEmitter | the event bus |
| `event_types` | object | event name enum |
| `backgrounds` | object | background provider API (see §4) |

## 3. Events — `event_types`

### Life cycle
- `APP_INITIALIZED` — core modules done wiring.
- `APP_READY` — full boot complete, UI ready. Auto-fires for late subscribers.
- `appReady` (exported promise) — resolves on first `APP_READY`.

### Chat
- `USER_MESSAGE_RENDERED(messageId)` — user's message just hit the DOM.
- `CHARACTER_MESSAGE_RENDERED(messageId, type)` — character's message rendered.

### Prompt manager (chat completion)
- `PROMPT_LIST_RENDERED({ list, prefix, characterId, promptCount })` — the
  `<ul>` of prompt items was just (re)rendered. **Auto-fires** for late
  subscribers.
- `PROMPT_TOGGLE_CHANGED({ promptID, enabled, characterId })` — user
  flipped an individual prompt's on/off state.

### World Info
- `WORLDINFO_ENTRY_RENDERED({ element, entry, worldName, data })` — one
  WI entry element was built by `getWorldEntry`. NOT auto-fired.
- `WORLDINFO_LIST_RENDERED({ list, worldName, data, entryCount })` —
  WI entries list finished rendering. Auto-fires.

### Personas
- `PERSONA_LIST_RENDERED({ list, avatars, page })` — paginated persona
  list rendered a page. Auto-fires.
- `PERSONA_CHANGED(avatarId)` — selected persona changed.

### Backgrounds
- `BACKGROUND_CHANGED({ bg, url, mediaType })` — `setBackground()`
  finished applying (either via a registered provider or the built-in
  image fallback).

### UI
- `PANEL_SHOWN({ panelId, drawer })` — a top-nav drawer opened.
- `PANEL_HIDDEN({ panelId, drawer })` — a top-nav drawer closed.

## 4. Backgrounds provider API

Register a handler for custom media types (video, YouTube, GIF, etc.)
instead of monkey-patching `window.setBackground`.

```js
const st = await SillyTavern.ready;
st.backgrounds.registerBackgroundProvider({
    mediaType: 'video',
    test(url, bg, mediaType) {
        return /\.(mp4|webm|mov)($|\?)/i.test(url || '');
    },
    async apply(target, url, bg, mediaType) {
        // `target` is the #bg1 element. Own the visual.
        const v = document.createElement('video');
        v.src = url; v.autoplay = true; v.loop = true; v.muted = true;
        target.innerHTML = ''; target.appendChild(v);
    },
});
```

The first registered provider whose `test()` returns true wins. If none
match, the built-in `background-image` behavior runs as the fallback.

## 5. CSS selector contract — `data-st-role`

Prefer `[data-st-role="..."]` over class/id selectors. Classes may be
renamed or decomposed in refactors; the `data-st-role` contract is
stable public API. Current roles:

### Chat completion prompt list
- `prompt-list` — `<ul>` container
- `prompt-item` — each `<li>` prompt row
- `prompt-name` — prompt display name span
- `prompt-drag-handle` — drag grip
- `prompt-toggle` — on/off icon (also has `data-st-enabled="true|false"`)
- `prompt-edit` — pencil icon
- `prompt-detach` — remove/chain-broken icon

### World info
- `wi-list` — entries container
- `wi-entry` — single entry root

### Personas
- `persona-list` — `#user_avatar_block`
- `persona-item` — each avatar tile

### Chat messages
- `chat-scroll` — `#chat` scroll container
- `chat-message` — each `.mes`
- `chat-avatar` — message avatar
- `chat-name` — display name text
- `chat-actions` — per-message action button row

## 6. Version

This contract is **v1.0** as of the `nemo-integration` branch. Changes
to any name in sections 1–5 require a version bump and a migration note
here.
