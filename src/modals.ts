import { Modal, Notice } from "obsidian";
import ElevenLabsPlugin from "../main";
import { generateAudio } from "./util/audio";
import { createVaultDirectories } from "./util/file";
import {
    renderGenerateAudioButton,
    renderTextSection,
    renderVoiceSelect,
    renderModelSelect,
    renderVoiceSettings,
    renderModelLanguageChips,
} from "./util/ui";

export class ElevenLabsModal extends Modal {
    plugin: ElevenLabsPlugin;
    selectedText: string;

    constructor(plugin: ElevenLabsPlugin, selectedText: string) {
        super(plugin.app);
        this.plugin = plugin;
        this.selectedText = selectedText;
        this.shouldRestoreSelection = true;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass("eleven-labs-modal");

        let voiceSettings: any;
        let voiceSelectEl: HTMLSelectElement;
        let modelSelectEl: HTMLSelectElement;

        // Settings
        contentEl.createDiv("settings", (el) => {
            // Select voice
            voiceSelectEl = renderVoiceSelect(this.plugin, el, () => {
                voiceSettings = renderVoiceSettings(
                    this.plugin,
                    voiceSettingsContainer
                );
            });

            // Select model
            modelSelectEl = renderModelSelect(this.plugin, el, () => {
                renderModelLanguageChips(this.plugin, languageChipsContainer);
            });

            // Language chips
            const languageChipsContainer = el.createDiv("chips-container");
            renderModelLanguageChips(this.plugin, languageChipsContainer);

            // Divider
            el.createEl("hr");

            const voiceSettingsContainer = el.createDiv("voice-settings");

            // Voice settings
            voiceSettings = renderVoiceSettings(
                this.plugin,
                voiceSettingsContainer
            );

            // Divider
            el.createEl("hr");
        });

        // Text
        renderTextSection(contentEl, this.selectedText);

        // Actions
        contentEl.createDiv("actions", (el) => {
            renderGenerateAudioButton(el, () => {
                new Notice("Eleven Labs: Generating audio...", 5000);
                createVaultDirectories(this.app.vault, [
                    "ElevenLabs",
                    "ElevenLabs/Audio",
                ]);
                generateAudio(
                    this.plugin,
                    this.selectedText,
                    voiceSelectEl.options[voiceSelectEl.selectedIndex].text,
                    voiceSelectEl.value,
                    modelSelectEl.options[modelSelectEl.selectedIndex].text,
                    modelSelectEl.value,
                    voiceSettings.voiceSettingsToggle.getValue(),
                    voiceSettings.stabilitySlider.getValue(),
                    voiceSettings.similaritySlider.getValue()
                );
                this.close();
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
