import {
    Modal,
    MarkdownView,
    ButtonComponent,
    SliderComponent,
    TextAreaComponent,
} from "obsidian";
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

        const actionsEl = contentEl.createDiv();

        // Create button
        new ButtonComponent(actionsEl)
            .setClass("btn-generate-audio")
            .setButtonText("Generate audio")
            .onClick(() => {
                const voiceName = selectEl.options[selectEl.selectedIndex].text;
                const voiceId = selectEl.value;
                this.createFiles();

                const activeView =
                    this.app.workspace.getActiveViewOfType(MarkdownView);
                console.log(activeView);

                // textToSpeech(this.plugin.settings.apiKey, this.selectedText, voiceId).then((response: any) => {
                //     new Notice("Eleven Labs: Audio file created!");

                //     const filename = `${Date.now()}-${voiceName}-${voiceId}`;

                //     this.app.vault.createBinary(`ElevenLabs/Audio/${filename}.mp3`, response.data);
                //     this.app.vault.create(`ElevenLabs/${filename}.md`, `**Voice:** ${voiceName}\n**Timestamp:** 2022-08-13 at 14:30\n\n${this.selectedText}\n\n![[ElevenLabs/Audio/${filename}.mp3]]\n\n---`);
                // });
                this.close();
            });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    createFiles() {
        if (!this.app.vault.getAbstractFileByPath("ElevenLabs")) {
            this.app.vault.createFolder("ElevenLabs");
        }
        if (!this.app.vault.getAbstractFileByPath("ElevenLabs/Audio")) {
            this.app.vault.createFolder("ElevenLabs/Audio");
        }
    }

    timestamp() {
        const date = new Date();
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(date.getDate()).padStart(2, "0")}_${String(
            date.getHours()
        ).padStart(2, "0")}-${String(date.getMinutes()).padStart(
            2,
            "0"
        )}-${String(date.getSeconds()).padStart(2, "0")}`;
    }
}
