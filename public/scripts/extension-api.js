// ============================================================================
// SillyTavern Extension API
// ----------------------------------------------------------------------------
// Stable, documented re-export surface for extensions.
//
// Use this file instead of deep relative imports like
//   import { eventSource } from '../../../../script.js';
//
// Why: those paths pin extensions to ST's exact folder layout, break when
// anything moves in core, and couple extensions to internal symbols that
// may not be part of the public contract. This barrel lets us rearrange
// core modules freely as long as the named exports below keep working.
//
// Scope: the symbols listed here are what the in-tree extensions (plus
// a survey of popular third-party ones — NemoPresetExt, ProsePolisher)
// actually import. Add more as real extensions start needing them, not
// speculatively.
//
// Versioning: the shape of each re-export matches ST's current internal
// definition. Breaking changes here are breaking changes for every
// extension — treat this file as public API.
// ============================================================================

// Event bus + event name enum
export { eventSource, event_types, appReady } from './events.js';

// Chat state + core lifecycle helpers
export {
    chat,
    chat_metadata,
    characters,
    this_chid,
    getRequestHeaders,
    getThumbnailUrl,
    saveChatDebounced,
    saveSettingsDebounced,
    saveMetadata,
    selectCharacterById,
    getCurrentChatId,
    generateQuietPrompt,
} from '../script.js';

// Group chat state
export { selected_group } from './group-chats.js';

// Public SillyTavern context accessor
export { getContext } from './st-context.js';

// Extension storage + registration
export { extension_settings } from './extensions.js';

// Popup helpers
export { callGenericPopup, POPUP_TYPE, Popup } from './popup.js';

// Chat Completion (OpenAI-compatible) state + prompt manager
export {
    oai_settings,
    openai_setting_names,
    model_list,
    promptManager,
} from './openai.js';

// Secrets (API keys, etc.) — read-only state only
export { secret_state } from './secrets.js';

// Tokenizer helpers
export { getTokenCountAsync } from './tokenizers.js';

// Tool calling
export { ToolManager } from './tool-calling.js';

// Reasoning UI
export { updateReasoningUI } from './reasoning.js';

// Background system (provider API, see backgrounds.js)
export {
    setBackground,
    registerBackgroundProvider,
    detectBackgroundMediaType,
} from './backgrounds.js';

// Template rendering
export { renderTemplateAsync, renderTemplate } from './templates.js';

// Common utility functions extensions reach for
export {
    debounce,
    escapeHtml,
    sortIgnoreCaseAndAccents,
} from './utils.js';
