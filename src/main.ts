import {
    Editor,
    MarkdownView,
    Plugin,
    Menu,
    MarkdownFileInfo,
    TAbstractFile,
    WorkspaceLeaf,
} from "obsidian";
import {
    ElevenLabsPluginSettings,
    DEFAULT_SETTINGS,
    ElevenLabsSettingTab,
} from "./settings";
import { getVoices } from "./eleven_labs_api";
import { ElevenLabsModal } from "./modals";

export default class ElevenLabsPlugin extends Plugin {
    settings: ElevenLabsPluginSettings;
    voices: any[];

    addContextMenuItems = (
        menu: Menu,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
    ) => {
        menu.addItem((item) => {
            const markdownView =
                this.app.workspace.getActiveViewOfType(MarkdownView);
            const selectedText = markdownView?.editor.getSelection();

            item.setTitle("Eleven Labs")
                .setIcon("file-audio")
                .onClick(async () => {
                    if (selectedText != null) {
                        new ElevenLabsModal(this, selectedText).open();
                    }
                });

            item.setDisabled(selectedText == null); // Disable the item if no text is selected
        });
    };

    async onload() {
        await this.loadSettings();

        // Load voices
        const response = await getVoices(this.settings.apiKey);
        this.voices = response.data.voices;

        // Add context menu item
        this.app.workspace.on("editor-menu", this.addContextMenuItems);

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ElevenLabsSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
