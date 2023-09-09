import { App, PluginSettingTab, Setting } from "obsidian";
import ElevenLabsPlugin from "../main";

export interface VoiceSettings {
    enabled: boolean;
    stability: number;
    similarity_boost: number;
}

export interface ElevenLabsPluginSettings {
    apiKey: string;
    selectedVoiceId: string | null;
    voiceSettings: { [key: string]: VoiceSettings }
}

export const DEFAULT_SETTINGS: ElevenLabsPluginSettings = {
    apiKey: "",
    selectedVoiceId: null,
    voiceSettings: {},
};

export class ElevenLabsSettingTab extends PluginSettingTab {
    plugin: ElevenLabsPlugin;

    constructor(app: App, plugin: ElevenLabsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("API Key")
            .setDesc("Your Eleven Labs API Key")
            .addText(
                (text) =>
                    (text
                        .setPlaceholder("Enter your API Key")
                        .setValue(this.plugin.settings.apiKey)
                        .onChange(async (value) => {
                            this.plugin.settings.apiKey = value;
                            await this.plugin.saveSettings();
                        }).inputEl.type = "password") // Set input type to password
            );
    }
}
