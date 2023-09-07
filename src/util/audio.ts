import { Notice, MarkdownView, Vault } from "obsidian";
import { generateFilename } from "./file";
import ElevenLabsApi, { VoiceSettings } from "src/eleven_labs_api";
import ElevenLabsPlugin from "main";

function createNoteMetadata(voiceName: string, voiceId: string, date: Date) {
    return `
---
voice: ${voiceName}
voice_id: ${voiceId}
model: eleven_monolingual_v1
created: 2023-09-06T12:00:00
tags: [eleven-labs]
---
`;
}

function createAudioNote(
    vault: Vault,
    text: string,
    filename: string,
    voiceName: string,
    voiceId: string,
    enabled: boolean,
    stability: number,
    similarityBoost: number,
    date: Date,
    notePath: string | undefined
) {
    const metadata = createNoteMetadata(voiceName, voiceId, date);
    console.log("Created meteadata:", metadata);
    const content = `
${metadata}

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
    console.log("Creating audio file:", filename, vault, data);
    vault.createBinary(`ElevenLabs/Audio/${filename}.mp3`, data);
    console.log("Created audio file:", filename);
}

export function generateAudio(
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

    ElevenLabsApi.textToSpeech(
        plugin.settings.apiKey,
        text,
        voiceId,
        voiceSettings
    )
        .then((response: any) => {
            const date = new Date();
            const filename = generateFilename(voiceName, date);
            new Notice(`Eleven Labs: Created audio file (${filename})`, 5000);

            createAudioFile(plugin.app.vault, filename, response);
            createAudioNote(
                plugin.app.vault,
                text,
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
