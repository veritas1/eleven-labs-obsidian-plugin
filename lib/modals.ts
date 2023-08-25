import { Modal, Notice } from "obsidian";
import ElevenLabsPlugin from "../main";
import { textToSpeech } from "./eleven_labs_api";

export class ElevenLabsModal extends Modal {
    plugin: ElevenLabsPlugin;
    selectedText: string;

    constructor(plugin: ElevenLabsPlugin, selectedText: string) {
        super(plugin.app);
        this.plugin = plugin;
        this.selectedText = selectedText;
        this.shouldRestoreSelection = true;
    }

    addVoicesToOptionGroup(voices: any[], optgroupEl: HTMLElement) {
        voices.forEach((voice) => {
            const optionEl = optgroupEl.createEl("option", {
                text: voice.name,
                value: voice.voice_id,
            });
            // Check if this option was the previously selected option
            if (voice.voice_id === this.plugin.settings.selectedVoiceId) {
                optionEl.setAttribute("selected", "selected");
            }
        });
    }

    addCategory(
        selectEl: HTMLElement,
        label: string,
        voices: any[] | undefined
    ) {
        if (voices) {
            const optgroupEl = selectEl.createEl("optgroup");
            optgroupEl.label = label;
            this.addVoicesToOptionGroup(voices, optgroupEl);
        }
    }

    voicesGroupedByCategory() {
        return this.plugin.voices.reduce((acc, voice) => {
            // If the category hasn't been seen before, create an empty array for it
            if (!acc.has(voice.category)) {
                acc.set(voice.category, []);
            }

            // Push the current voice to its category array
            acc.get(voice.category).push(voice);

            return acc;
        }, new Map());
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createDiv({ text: this.selectedText });

        const actionsEl = contentEl.createDiv();

        // Create dropdown
        const selectEl = actionsEl.createEl("select");

        // Add default prompt option
        const defaultOptionEl = selectEl.createEl("option", {
            text: "Select a voice",
        });
        defaultOptionEl.setAttribute("selected", "selected");
        defaultOptionEl.setAttribute("disabled", "disabled");

        // Add voices to dropdown (grouped by category)
        const groupedByCategory: Map<string, any[]> =
            this.voicesGroupedByCategory();

        this.addCategory(selectEl, "Cloned", groupedByCategory.get("cloned"));
        this.addCategory(
            selectEl,
            "Generated",
            groupedByCategory.get("generated")
        );
        this.addCategory(selectEl, "Premade", groupedByCategory.get("premade"));

        selectEl.addEventListener("change", (_) => {
            const selectedOption = selectEl.value;
            console.log("Selected option:", selectedOption);
            this.plugin.settings.selectedVoiceId = selectedOption;
            this.plugin.saveSettings();
        });

        // Create button
        const buttonEl = actionsEl.createEl("button", { text: "Generate" });
        buttonEl.onClickEvent(() => {
            const voice_id = selectEl.value;

            textToSpeech(this.plugin.settings.apiKey, this.selectedText, voice_id).then((response: any) => { 
                new Notice("Audio generated homie!");
   
                if (!this.app.vault.getAbstractFileByPath("ElevenLabs")) {
                    this.app.vault.createFolder("ElevenLabs");
                }
                if (!this.app.vault.getAbstractFileByPath("ElevenLabs/Audio")) {
                    console.log("Creating Audio folder");
                    this.app.vault.createFolder("ElevenLabs/Audio");
                }
                this.app.vault.createBinary("ElevenLabs/Audio/test-3.mp3", response.data);
            });
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
