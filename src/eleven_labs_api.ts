import axios from "axios";

export const BASE_URL = "https://api.elevenlabs.io/v1";

export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
}

interface TextToSpeechRequest { 
    text: string;
    voice_settings?: VoiceSettings;
}

class ElevenLabsApi {
    static async getVoices(apiKey: string) {

        return axios
            .get(`${BASE_URL}/voices`, {
                headers: {
                    "xi-api-key": apiKey,
                },
            });
    }
    static async textToSpeech(
        apiKey: string,
        text: string,
        voiceId: string,
        options?: VoiceSettings
    ) {
        const data: TextToSpeechRequest = {
            text: text,
        };
        if (options) {
            const settings: VoiceSettings = {
                stability: options.stability/100.0,
                similarity_boost: options.similarity_boost/100.0,
            };
            data.voice_settings = settings;
        }

        return axios
            .post(`${BASE_URL}/text-to-speech/${voiceId}`, data, {
                headers: {
                    Accept: "audio/mpeg",
                    "xi-api-key": apiKey,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            });
    }
}

export default ElevenLabsApi;
