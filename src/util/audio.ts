import { Notice, MarkdownView } from "obsidian";
import { generateFilename } from "./file";
import ElevenLabsApi, { VoiceSettings } from "src/eleven_labs_api";

function createNoteMetadata(voiceName: string, voiceId: string, date: Date) {
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

function createAudioNote(
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

function createAudioFile(filename: string, data: any) {
    this.app.vault.createBinary(`ElevenLabs/Audio/${filename}.mp3`, data);
}

export function generateAudio(
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

    ElevenLabsApi.textToSpeech(
        this.plugin.settings.apiKey,
        this.selectedText,
        voiceId,
        voiceSettings
    )
        .then((response: any) => {
            const date = new Date();
            const filename = generateFilename(voiceName, date);
            new Notice(`Eleven Labs: Created audio file (${filename})`, 5000);

            createAudioFile(filename, response.data);
            createAudioNote(
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
