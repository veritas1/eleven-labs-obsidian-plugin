import ElevenLabsPlugin from "main";
import {
    ButtonComponent,
    SliderComponent,
    TextAreaComponent,
    ToggleComponent,
} from "obsidian";
import { VoiceSettings } from "src/settings";

export function renderGenerateAudioButton(
    parent: HTMLElement,
    callback: () => void
) {
    // Generate audio button
    new ButtonComponent(parent)
        .setClass("btn-generate-audio")
        .setButtonText("Generate audio")
        .onClick(callback);
}

export function renderVoiceSettings(
    plugin: ElevenLabsPlugin,
    parent: HTMLElement
) {

    parent.innerHTML = "";

    const selectedVoiceId = plugin.settings.selectedVoiceId || "";

    let voiceSettings: VoiceSettings =
        plugin.settings.voiceSettings[selectedVoiceId];
    if (voiceSettings == undefined) {
        voiceSettings = {
            enabled: false,
            stability: 0,
            similarity_boost: 0,
        };
        plugin.settings.voiceSettings[selectedVoiceId] = voiceSettings;
    }

    parent.createEl("h6", { text: "Voice Settings" });
    const voiceSettingsToggle = new ToggleComponent(parent)
        .setValue(voiceSettings.enabled)
        .setTooltip("Enable voice settings")
        .onChange((value) => {
            voiceSettingsContainer.toggle(value);
            plugin.settings.voiceSettings[selectedVoiceId]["enabled"] = value;
        });
    const voiceSettingsContainer = parent.createDiv("voice-settings-container");
    voiceSettingsContainer.createDiv({
        cls: "voice-settings-description",
        text: "These settings will override the stored settings for this voice. They only apply to this audio file.",
    });

    voiceSettingsContainer.toggle(voiceSettings.enabled);

    const stabilityInitialValue =
        plugin.settings.voiceSettings[selectedVoiceId]["stability"] || 0;

    const stabilityEl = voiceSettingsContainer.createEl("div", {
        text: `Stability: ${stabilityInitialValue}`,
    });
    const stabilitySlider = new SliderComponent(voiceSettingsContainer)
        .setValue(stabilityInitialValue) // Sets initial value
        .setLimits(0, 100, 1) // Minimum, Maximum, Step
        .onChange((value) => {
            stabilityEl.setText(`Stability: ${value}`);
            plugin.settings.voiceSettings[selectedVoiceId]["stability"] = value;
        });

    const similarityBoostInitialValue =
        plugin.settings.voiceSettings[selectedVoiceId]["similarity_boost"] || 0;

    const similarityEl = voiceSettingsContainer.createEl("div", {
        text: `Similarity boost: ${similarityBoostInitialValue}`,
    });
    // Add a slider
    const similaritySlider = new SliderComponent(voiceSettingsContainer)
        .setValue(similarityBoostInitialValue) // Sets initial value
        .setLimits(0, 100, 1) // Minimum, Maximum, Step
        .onChange((value) => {
            similarityEl.setText(`Similarity boost: ${value}`);
            plugin.settings.voiceSettings[selectedVoiceId]["similarity_boost"] =
                value;
        });

    return {
        voiceSettingsToggle,
        stabilitySlider,
        similaritySlider,
    };
}

export function renderTextSection(parent: HTMLElement, selectedText: string) {
    parent.createDiv("text-area", (el) => {
        // Title
        el.createEl("h6", { text: "Text" });

        // Text area
        new TextAreaComponent(el)
            .setPlaceholder("Enter text here")
            .setValue(selectedText)
            .setDisabled(true);

        // Character count
        const charCountEl = el.createDiv("char-count");
        charCountEl.setText(`Characters: ${selectedText.length}`);
    });
}

function addVoicesToOptionGroup(
    voices: any[],
    optgroupEl: HTMLElement,
    selectedVoiceId: string
) {
    voices.forEach((voice) => {
        const optionEl = optgroupEl.createEl("option", {
            text: voice.name,
            value: voice.voice_id,
        });
        // Check if this option was the previously selected option
        if (voice.voice_id === selectedVoiceId) {
            optionEl.setAttribute("selected", "selected");
        }
    });
}

function addCategory(
    selectEl: HTMLElement,
    label: string,
    voices: any[] | undefined,
    selectedVoiceId: string
) {
    if (voices) {
        const optgroupEl = selectEl.createEl("optgroup");
        optgroupEl.label = label;
        addVoicesToOptionGroup(voices, optgroupEl, selectedVoiceId);
    }
}

function voicesGroupedByCategory(voices: any[]) {
    return voices.reduce((acc, voice) => {
        // If the category hasn't been seen before, create an empty array for it
        if (!acc.has(voice.category)) {
            acc.set(voice.category, []);
        }

        // Push the current voice to its category array
        acc.get(voice.category).push(voice);

        return acc;
    }, new Map());
}

export function renderVoiceSelect(
    plugin: ElevenLabsPlugin,
    parent: HTMLElement,
    onVoiceSelected: () => void
): HTMLSelectElement {
    const voices: any[] = plugin.voices;
    const selectedVoiceId: string = plugin.settings.selectedVoiceId || "";
    return parent.createEl("select", "dropdown", (selectEl) => {
        // Add default prompt option
        const defaultOptionEl = selectEl.createEl("option", {
            text: "Select a voice",
        });
        defaultOptionEl.setAttribute("selected", "selected");
        defaultOptionEl.setAttribute("disabled", "disabled");

        // Add voices to dropdown (grouped by category)
        const groupedByCategory: Map<string, any[]> =
            voicesGroupedByCategory(voices);

        addCategory(
            selectEl,
            "Cloned",
            groupedByCategory.get("cloned"),
            selectedVoiceId
        );
        addCategory(
            selectEl,
            "Generated",
            groupedByCategory.get("generated"),
            selectedVoiceId
        );
        addCategory(
            selectEl,
            "Premade",
            groupedByCategory.get("premade"),
            selectedVoiceId
        );

        selectEl.addEventListener("change", (_) => {
            const selectedOption = selectEl.value;
            plugin.settings.selectedVoiceId = selectedOption;
            plugin.saveSettings();
            onVoiceSelected();
        });
    });
}
