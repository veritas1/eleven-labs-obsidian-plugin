import axios from "axios";

const BASE_URL = "https://api.elevenlabs.io/v1";

interface SpeechOptions {
    stability?: number;
    similarity_boost?: number;
    model_id?: string;
}

export function getVoices(apiKey: string): Promise<any> {
    return axios({
        method: "GET",
        url: `${BASE_URL}/voices`,
        headers: {
            "xi-api-key": apiKey,
        },
    })
 }

export function textToSpeech(apiKey: string, text: string, voiceId: string, options?: SpeechOptions): Promise<any> {
    return axios({
        method: "POST",
        url: `${BASE_URL}/text-to-speech/${voiceId}`,
        data: {
            text: text,
            voice_settings: {
                stability: options?.stability || 0,
                similarity_boost: options?.similarity_boost || 0,
            },
            model_id: options?.model_id || undefined,
        },
        headers: {
            Accept: "audio/mpeg",
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
    })
}
