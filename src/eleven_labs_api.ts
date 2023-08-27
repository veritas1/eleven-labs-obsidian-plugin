import axios from "axios";

const BASE_URL = "https://api.elevenlabs.io/v1";

export interface VoiceSettings {
    stability?: number;
    similarityBoost?: number;
}

class ElevenLabsApi {
    static async getVoices(apiKey: string): Promise<any> {
        return axios
            .get(`${BASE_URL}/voices`, {
                headers: {
                    "xi-api-key": apiKey,
                },
            })
            .then((response) => {
                return response.data.voices;
            });
    }
    static async textToSpeech(
        apiKey: string,
        text: string,
        voiceId: string,
        options?: VoiceSettings
    ): Promise<any> {
        return axios
            .post(`${BASE_URL}/text-to-speech/${voiceId}`, {
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
            })
            .then((response) => {
                return response.data;
            });
    }
}

export default ElevenLabsApi;
