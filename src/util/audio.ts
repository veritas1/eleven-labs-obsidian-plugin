import { Notice, MarkdownView, Vault } from "obsidian";
import { generateFilename } from "./file";
import ElevenLabsApi, { VoiceSettings } from "src/eleven_labs_api";
import ElevenLabsPlugin from "main";
import axios from "axios";

function createAudioNote(
    vault: Vault,
    text: string,
    filename: string,
    voiceName: string,
    enabled: boolean,
    stability: number,
    similarityBoost: number,
    date: Date,
    notePath: string | undefined
) {
    const content = `
**Voice:** ${voiceName}
**Model:** eleven_monolingual_v1
**Created:** ${date.toLocaleString()}
**Voice Settings Enabled:** ${enabled}
**Stability:** ${stability}
**Similarity Boost:** ${similarityBoost}
**Note:** [[${notePath}]]

> ${text}

![[ElevenLabs/Audio/${filename}.mp3]]

---
`;
    vault.create(`ElevenLabs/${filename}.md`, content);
}

function createAudioFile(vault: Vault, filename: string, data: any) {
    vault.createBinary(`ElevenLabs/Audio/${filename}.mp3`, data);
}

export async function generateAudio(
    plugin: ElevenLabsPlugin,
    text: string,
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
            similarity_boost: similarityBoost,
        };
    }

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const notePath = activeView?.file?.basename;

    try {
        const response = await ElevenLabsApi.textToSpeech(
            plugin.settings.apiKey,
            text,
            voiceId,
            voiceSettings
        );

        console.log(response);

        const date = new Date();
        const filename = generateFilename(voiceName, date);

        createAudioFile(plugin.app.vault, filename, response.arrayBuffer);
        createAudioNote(
            plugin.app.vault,
            text,
            filename,
            voiceName,
            enabled,
            stability,
            similarityBoost,
            date,
            notePath
        );
        new Notice(`Eleven Labs: Created audio file (${filename})`, 5000);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const stringResponse = String.fromCharCode.apply(
                null,
                new Uint8Array(error.response?.data)
            );
            const jsonResponse = JSON.parse(stringResponse);
            new Notice(`Eleven Labs: ${jsonResponse.detail.message}`, 0);
        } else {
            new Notice("Eleven Labs: Unknown error occurred", 0);
        }
        console.log(error);
    }
}
