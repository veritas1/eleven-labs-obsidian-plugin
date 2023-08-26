import {
    Modal,
    MarkdownView,
    ButtonComponent,
    SliderComponent,
    TextAreaComponent,
    Notice,
} from "obsidian";
import ElevenLabsPlugin from "./main";
import { VoiceSettings, textToSpeech } from "./eleven_labs_api";

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

        const settingsEl = contentEl.createDiv("settings");
        // Create dropdown
        const selectEl = settingsEl.createEl("select", "dropdown");
        selectEl.setCssProps({
            width: "100%",
        });
        settingsEl.createEl("hr");
        settingsEl.createEl("h6", { text: "Voice settings" });
        settingsEl.createDiv({
            text: "These settings will override the stored settings for this voice. They only apply to this audio file.",
        });

        const enableEl = settingsEl.createEl("div", "enable");
        enableEl.createEl("span", { text: "Enable:" });
        const enabled = enableEl.createEl("input", { type: "checkbox" });
        enabled.addEventListener("change", (event) => {
            const checked = (event.target as HTMLInputElement).checked;
            console.log(checked);
            stabilitySlider.setDisabled(!checked);
            similaritySlider.setDisabled(!checked);
        });

        // Create a label for the slider
        const stabilityEl = settingsEl.createEl("div", {
            text: "Stability: 0",
        });

        // Add a slider
        const stabilitySlider = new SliderComponent(settingsEl)
            .setValue(0) // Sets initial value
            .setLimits(0, 100, 1) // Minimum, Maximum, Step
            .setDisabled(true)
            .onChange((value) => {
                console.log("Stability value:", value);
                stabilityEl.setText(`Stability: ${value}`);
            });

        // Create a label for the slider
        const similarityEl = settingsEl.createEl("div", {
            text: "Similarity boost: 0",
        });

        // Add a slider
        const similaritySlider = new SliderComponent(settingsEl)
            .setValue(0) // Sets initial value
            .setLimits(0, 100, 1) // Minimum, Maximum, Step
            .setDisabled(true)
            .onChange((value) => {
                console.log("Similarity value:", value);
                similarityEl.setText(`Similarity boost: ${value}`);
            });

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
            this.plugin.settings.selectedVoiceId = selectedOption;
            this.plugin.saveSettings();
        });

        settingsEl.createEl("hr");

        const textAreaEl = contentEl.createDiv("text-area");
        textAreaEl.createEl("h6", { text: "Text" });
        new TextAreaComponent(textAreaEl)
            .setPlaceholder("Enter text here")
            .setValue(this.selectedText)
            .setDisabled(true);

        const charCountEl = textAreaEl.createDiv("char-count");
        charCountEl.setText(`Characters: ${this.selectedText.length}`);

        const actionsEl = contentEl.createDiv();

        // Create button
        new ButtonComponent(actionsEl)
            .setClass("btn-generate-audio")
            .setButtonText("Generate audio")
            .onClick(() => {
                new Notice("Eleven Labs: Generating audio...", 5000);
                this.createFiles();
                const voiceName = selectEl.options[selectEl.selectedIndex].text;
                const voiceId = selectEl.value;
                const enableVoiceSettings = enabled.checked;
                const stability = stabilitySlider.getValue();
                const similarityBoost = similaritySlider.getValue();
                this.generateAudio(
                    voiceName,
                    voiceId,
                    enableVoiceSettings,
                    stability,
                    similarityBoost
                );
                this.close();
            });
    }

    generateAudio(
        voiceName: string,
        voiceId: string,
        enabled: boolean,
        stability: number,
        similarityBoost: number
    ) {
        let voiceSettings: VoiceSettings | undefined = undefined;
        if (enabled) {
            voiceSettings = {
                stability: stability,
                similarityBoost: similarityBoost,
            };
        }

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const notePath = activeView?.file?.basename;
        console.log(notePath);

        textToSpeech(
            this.plugin.settings.apiKey,
            this.selectedText,
            voiceId,
            voiceSettings
        )
            .then((response: any) => {
                const date = new Date();
                const filename = this.generateFilename(voiceName, date);
                new Notice(
                    `Eleven Labs: Created audio file (${filename})`,
                    5000
                );

                this.createAudioFile(filename, response.data);
                this.createAudioNote(
                    filename,
                    voiceName,
                    voiceId,
                    enabled,
                    stability,
                    similarityBoost,
                    date,
                    notePath
                );
            })
            .catch((error) => {
                new Notice(`Eleven Labs: ${error.detail.message}`, 0);
                console.log(error);
            });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    createNoteMetadata(voiceName: string, voiceId: string, date: Date) {
        return `
---
voice: ${voiceName}
voice_id: ${voiceId}
model: eleven_monolingual_v1
created: ${date.toLocaleString()}
tags: [eleven-labs]
---
`;
    }

    createAudioNote(
        filename: string,
        voiceName: string,
        voiceId: string,
        enabled: boolean,
        stability: number,
        similarityBoost: number,
        date: Date,
        notePath: string | undefined
    ) {
        const metadata = this.createNoteMetadata(voiceName, voiceId, date);
        const content = `
${metadata}

**Voice:** ${voiceName}
**Model:** eleven_monolingual_v1
**Created:** ${date.toLocaleString()}
**Voice Settings Overridden:** ${enabled}
**Stability:** ${stability}
**Similarity Boost:** ${similarityBoost}
**Note:** [[${notePath}]]

> ${this.selectedText}

![[ElevenLabs/Audio/${filename}.mp3]]

---
`;
        this.app.vault.create(`ElevenLabs/${filename}.md`, content);
    }

    createAudioFile(filename: string, data: any) {
        this.app.vault.createBinary(`ElevenLabs/Audio/${filename}.mp3`, data);
    }

    createFiles() {
        if (!this.app.vault.getAbstractFileByPath("ElevenLabs")) {
            this.app.vault.createFolder("ElevenLabs");
        }
        if (!this.app.vault.getAbstractFileByPath("ElevenLabs/Audio")) {
            this.app.vault.createFolder("ElevenLabs/Audio");
        }
    }

    generateFilename(voiceName: string, date: Date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${year}-${month}-${day}_${hour}-${minutes}-${seconds}_${voiceName}`;
    }
}
