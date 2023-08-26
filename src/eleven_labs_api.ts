import axios from "axios";

const BASE_URL = "https://api.elevenlabs.io/v1";

export interface VoiceSettings {
    stability?: number;
    similarityBoost?: number;
}

export function getVoices(apiKey: string): Promise<any> {
    return axios({
        method: "GET",
        url: `${BASE_URL}/voices`,
        headers: {
            "xi-api-key": apiKey,
        },
    });
}

export function textToSpeech(
    apiKey: string,
    text: string,
    voiceId: string,
    options?: VoiceSettings
): Promise<any> {
    return axios({
        method: "POST",
        url: `${BASE_URL}/text-to-speech/${voiceId}`,
        data: {
            text: text,
            voice_settings: {
                stability: options?.stability || 0,
                similarity_boost: options?.similarityBoost || 0,
            },
        },
        headers: {
            Accept: "audio/mpeg",
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
    });
}
