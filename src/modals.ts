import { Modal, Notice } from "obsidian";
import ElevenLabsPlugin from "../main";
import { generateAudio } from "./util/audio";
import { createVaultDirectories } from "./util/file";
import {
    renderGenerateAudioButton,
    renderTextSection,
    renderVoiceSelect,
    renderVoiceSettings,
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

        let voiceSettings: any;
        let selectEl: HTMLSelectElement;

        // Settings
        contentEl.createDiv("settings", (el) => {
            // Select voice
            selectEl = renderVoiceSelect(
                this.plugin,
                el
            );

            // Divider
            el.createEl("hr");

            // Voice settings
            voiceSettings = renderVoiceSettings(el);

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
                    selectEl.options[selectEl.selectedIndex].text,
                    selectEl.value,
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
