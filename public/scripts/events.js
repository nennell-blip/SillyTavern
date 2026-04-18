import { EventEmitter } from '../lib/eventemitter.js';

export const event_types = {
    APP_INITIALIZED: 'app_initialized',
    APP_READY: 'app_ready',
    EXTRAS_CONNECTED: 'extras_connected',
    MESSAGE_SWIPED: 'message_swiped',
    MESSAGE_SENT: 'message_sent',
    MESSAGE_RECEIVED: 'message_received',
    MESSAGE_EDITED: 'message_edited',
    MESSAGE_DELETED: 'message_deleted',
    MESSAGE_UPDATED: 'message_updated',
    MESSAGE_FILE_EMBEDDED: 'message_file_embedded',
    MESSAGE_REASONING_EDITED: 'message_reasoning_edited',
    MESSAGE_REASONING_DELETED: 'message_reasoning_deleted',
    MESSAGE_SWIPE_DELETED: 'message_swipe_deleted',
    MORE_MESSAGES_LOADED: 'more_messages_loaded',
    IMPERSONATE_READY: 'impersonate_ready',
    CHAT_CHANGED: 'chat_id_changed',
    // TODO: Naming convention is inconsistent with other events
    CHAT_LOADED: 'chatLoaded',
    GENERATION_AFTER_COMMANDS: 'GENERATION_AFTER_COMMANDS',
    GENERATION_STARTED: 'generation_started',
    GENERATION_STOPPED: 'generation_stopped',
    GENERATION_ENDED: 'generation_ended',
    SD_PROMPT_PROCESSING: 'sd_prompt_processing',
    EXTENSIONS_FIRST_LOAD: 'extensions_first_load',
    EXTENSION_SETTINGS_LOADED: 'extension_settings_loaded',
    SETTINGS_LOADED: 'settings_loaded',
    SETTINGS_UPDATED: 'settings_updated',
    GROUP_UPDATED: 'group_updated',
    MOVABLE_PANELS_RESET: 'movable_panels_reset',
    SETTINGS_LOADED_BEFORE: 'settings_loaded_before',
    SETTINGS_LOADED_AFTER: 'settings_loaded_after',
    CHATCOMPLETION_SOURCE_CHANGED: 'chatcompletion_source_changed',
    CHATCOMPLETION_MODEL_CHANGED: 'chatcompletion_model_changed',
    OAI_PRESET_CHANGED_BEFORE: 'oai_preset_changed_before',
    OAI_PRESET_CHANGED_AFTER: 'oai_preset_changed_after',
    OAI_PRESET_EXPORT_READY: 'oai_preset_export_ready',
    OAI_PRESET_IMPORT_READY: 'oai_preset_import_ready',
    WORLDINFO_SETTINGS_UPDATED: 'worldinfo_settings_updated',
    WORLDINFO_UPDATED: 'worldinfo_updated',
    CHARACTER_EDITOR_OPENED: 'character_editor_opened',
    CHARACTER_EDITED: 'character_edited',
    CHARACTER_PAGE_LOADED: 'character_page_loaded',
    CHARACTER_GROUP_OVERLAY_STATE_CHANGE_BEFORE: 'character_group_overlay_state_change_before',
    CHARACTER_GROUP_OVERLAY_STATE_CHANGE_AFTER: 'character_group_overlay_state_change_after',
    USER_MESSAGE_RENDERED: 'user_message_rendered',
    CHARACTER_MESSAGE_RENDERED: 'character_message_rendered',
    FORCE_SET_BACKGROUND: 'force_set_background',
    CHAT_DELETED: 'chat_deleted',
    CHAT_CREATED: 'chat_created',
    CHAT_RENAMED: 'chat_renamed',
    GROUP_CHAT_DELETED: 'group_chat_deleted',
    GROUP_CHAT_CREATED: 'group_chat_created',
    GENERATE_BEFORE_COMBINE_PROMPTS: 'generate_before_combine_prompts',
    GENERATE_AFTER_COMBINE_PROMPTS: 'generate_after_combine_prompts',
    GENERATE_AFTER_DATA: 'generate_after_data',
    GROUP_MEMBER_DRAFTED: 'group_member_drafted',
    GROUP_WRAPPER_STARTED: 'group_wrapper_started',
    GROUP_WRAPPER_FINISHED: 'group_wrapper_finished',
    WORLD_INFO_ACTIVATED: 'world_info_activated',
    TEXT_COMPLETION_SETTINGS_READY: 'text_completion_settings_ready',
    CHAT_COMPLETION_SETTINGS_READY: 'chat_completion_settings_ready',
    CHAT_COMPLETION_PROMPT_READY: 'chat_completion_prompt_ready',
    CHARACTER_FIRST_MESSAGE_SELECTED: 'character_first_message_selected',
    // TODO: Naming convention is inconsistent with other events
    CHARACTER_DELETED: 'characterDeleted',
    CHARACTER_DUPLICATED: 'character_duplicated',
    CHARACTER_RENAMED: 'character_renamed',
    CHARACTER_RENAMED_IN_PAST_CHAT: 'character_renamed_in_past_chat',
    /** @deprecated The event is aliased to STREAM_TOKEN_RECEIVED. */
    SMOOTH_STREAM_TOKEN_RECEIVED: 'stream_token_received',
    STREAM_TOKEN_RECEIVED: 'stream_token_received',
    STREAM_REASONING_DONE: 'stream_reasoning_done',
    FILE_ATTACHMENT_DELETED: 'file_attachment_deleted',
    WORLDINFO_FORCE_ACTIVATE: 'worldinfo_force_activate',
    OPEN_CHARACTER_LIBRARY: 'open_character_library',
    ONLINE_STATUS_CHANGED: 'online_status_changed',
    IMAGE_SWIPED: 'image_swiped',
    CONNECTION_PROFILE_LOADED: 'connection_profile_loaded',
    CONNECTION_PROFILE_CREATED: 'connection_profile_created',
    CONNECTION_PROFILE_DELETED: 'connection_profile_deleted',
    CONNECTION_PROFILE_UPDATED: 'connection_profile_updated',
    TOOL_CALLS_PERFORMED: 'tool_calls_performed',
    TOOL_CALLS_RENDERED: 'tool_calls_rendered',
    CHARACTER_MANAGEMENT_DROPDOWN: 'charManagementDropdown',
    SECRET_WRITTEN: 'secret_written',
    SECRET_DELETED: 'secret_deleted',
    SECRET_ROTATED: 'secret_rotated',
    SECRET_EDITED: 'secret_edited',
    PRESET_CHANGED: 'preset_changed',
    PRESET_DELETED: 'preset_deleted',
    PRESET_RENAMED: 'preset_renamed',
    PRESET_RENAMED_BEFORE: 'preset_renamed_before',
    MAIN_API_CHANGED: 'main_api_changed',
    WORLDINFO_ENTRIES_LOADED: 'worldinfo_entries_loaded',
    WORLDINFO_SCAN_DONE: 'worldinfo_scan_done',
    MEDIA_ATTACHMENT_DELETED: 'media_attachment_deleted',
    PERSONA_CHANGED: 'persona_changed',
    PERSONA_CREATED: 'persona_created',
    PERSONA_UPDATED: 'persona_updated',
    PERSONA_RENAMED: 'persona_renamed',
    PERSONA_DELETED: 'persona_deleted',
    TTS_JOB_STARTED: 'tts_job_started',
    TTS_AUDIO_READY: 'tts_audio_ready',
    TTS_JOB_COMPLETE: 'tts_job_complete',
    ITEMIZED_PROMPTS_LOADED: 'itemized_prompts_loaded',
    ITEMIZED_PROMPTS_SAVED: 'itemized_prompts_saved',
    ITEMIZED_PROMPTS_DELETED: 'itemized_prompts_deleted',
    // Fired after the chat-completion prompt-manager list finishes rendering
    // its <li> items. Payload: { list: HTMLElement, prefix: string,
    // characterId: number|null, promptCount: number }. Extensions should
    // subscribe to this instead of running a MutationObserver on the list.
    PROMPT_LIST_RENDERED: 'prompt_list_rendered',
    // Fired after a single world-info entry element is built by
    // getWorldEntry. Payload: { element: JQuery, entry, worldName, data }.
    // Replaces the `window.getWorldEntry = ...` monkey-patch pattern.
    WORLDINFO_ENTRY_RENDERED: 'worldinfo_entry_rendered',
    // Fired after the WI entries list finishes rendering. Payload:
    // { list: HTMLElement|null, worldName, data, entryCount }.
    // Replaces the `window.displayWorldEntries = ...` monkey-patch.
    WORLDINFO_LIST_RENDERED: 'worldinfo_list_rendered',
    // Fired whenever setBackground() finishes applying a background.
    // Payload: { bg: string, url: string, mediaType: 'image'|'video'|'youtube'|string }.
    // Replaces the `window.setBackground = ...` monkey-patch for extensions
    // that just need to react to changes without taking over the apply step.
    BACKGROUND_CHANGED: 'background_changed',
    // Fired after the persona list finishes rendering a page of avatars.
    // Payload: { list: HTMLElement|null, avatars: string[], page: number }.
    // Replaces MutationObserver patterns on #user_avatar_block.
    PERSONA_LIST_RENDERED: 'persona_list_rendered',
};

export const eventSource = new EventEmitter([
    event_types.APP_READY,
    event_types.APP_INITIALIZED,
    // Auto-fire so extensions that subscribe *after* the first render still
    // get invoked with the most recent args. Matches the autoFire semantics
    // of APP_READY — "I'm here, catch me up".
    event_types.PROMPT_LIST_RENDERED,
    event_types.WORLDINFO_LIST_RENDERED,
    event_types.PERSONA_LIST_RENDERED,
    // WORLDINFO_ENTRY_RENDERED intentionally NOT auto-fired — it fires
    // per-entry during a list build; auto-firing would re-hit the
    // subscriber with whichever entry was last and confuse them.
]);

/**
 * Resolves once the app has finished booting (after `APP_READY` fires).
 *
 * Extensions should prefer `await appReady` (or `await SillyTavern.ready`)
 * over subscribing to `APP_READY` with `eventSource.on(...)` + a fallback
 * `setTimeout` poll. The underlying EventEmitter has `autoFireAfterEmit`
 * enabled for `APP_READY`, so this promise resolves reliably regardless
 * of whether the module importing it loads before or after the event fires.
 *
 * Replaces the old `OBSERVER_INIT_DELAY`-style "wait a bit and hope" dance.
 */
export const appReady = new Promise((resolve) => {
    eventSource.on(event_types.APP_READY, () => resolve());
});
