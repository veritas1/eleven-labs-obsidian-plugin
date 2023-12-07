import {
    Editor,
    MarkdownView,
    Plugin,
    Menu,
    MarkdownFileInfo,
    Notice,
} from "obsidian";
import {
    ElevenLabsPluginSettings,
    DEFAULT_SETTINGS,
    ElevenLabsSettingTab,
} from "./src/settings";
import ElevenLabsApi from "./src/eleven_labs_api";
import { ElevenLabsModal } from "./src/modals";
import axios from "axios";

export default class ElevenLabsPlugin extends Plugin {
    settings: ElevenLabsPluginSettings;
    voices: any[];
    models: any[];

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

    openModalCommand = {
        id: "eleven-labs-open-modal",
        name: "Open Modal",
        editorCheckCallback: (
            checking: boolean,
            editor: Editor,
            view: MarkdownView
        ) => {
            const selectedText = view?.editor.getSelection();
            if (selectedText) {
                if (!checking) {
                    new ElevenLabsModal(this, selectedText).open();
                }
                return true;
            }
            return false;
        },
    };

    async onload() {
        await this.loadSettings();

        // Load voices
        this.loadVoices();

        // Load models
        this.loadModels();

        // Add context menu item
        this.app.workspace.on("editor-menu", this.addContextMenuItems);

        // Add command to open modal
        this.addCommand(this.openModalCommand);

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ElevenLabsSettingTab(this.app, this));
    }

    onunload() {
        this.app.workspace.off("editor-menu", this.addContextMenuItems);
    }

    async loadVoices() {
        try {
            const response = await ElevenLabsApi.getVoices(
                this.settings.apiKey
            );
            this.voices = response.json.voices;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const stringResponse = String.fromCharCode.apply(
                    null,
                    new Uint8Array(error.response?.data)
                );
                const jsonResponse = JSON.parse(stringResponse);
                new Notice(`Eleven Labs: ${jsonResponse.detail.message}`, 0);
            }
        }
    }

    async loadModels() {
        try {
            const response = await ElevenLabsApi.getModels(
                this.settings.apiKey
            );
            this.models = response.json.filter(
                (m: any) => m.can_do_text_to_speech
            );
        } catch (error) {
            console.log(error);
        }
    }

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
