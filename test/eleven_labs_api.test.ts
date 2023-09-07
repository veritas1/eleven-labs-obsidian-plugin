import axios from "axios";
import ElevenLabsApi, { BASE_URL } from "../src/eleven_labs_api";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ElevenLabsApi", () => {

    const apiKey = 'yourApiKey';
    const text = 'sample text';
    const voiceId = 'sampleVoiceId';
    const options = {
        stability: 50,
        similarity_boost: 30,
    };

    beforeEach(() => {
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
    });

    describe("getVoices", () => {
        it("should return an array of voices", async () => {
            const response = {
                data: {
                    voices: [
                        {
                            voice_id: "voice_id_1",
                            name: "voice_name_1",
                            category: "voice_category_1",
                        },
                        {
                            voice_id: "voice_id_2",
                            name: "voice_name_2",
                            category: "voice_category_2",
                        },
                    ],
                },
            };

            mockedAxios.get.mockResolvedValue(response);

            const voices = await ElevenLabsApi.getVoices("api_key");
            expect(voices).toEqual(response.data.voices);
        });
    });

    describe("textToSpeech", () => {
        it("should return audio data", async () => {
            const response = {
                data: new ArrayBuffer(8),
            };

            mockedAxios.post.mockResolvedValue(response);

            const audio = await ElevenLabsApi.textToSpeech(
                "api_key",
                "text",
                "voice_id"
            );
            expect(audio).toEqual(response.data);
        });

        it('should not include voice_settings when options are null', async () => {
            await ElevenLabsApi.textToSpeech(apiKey, text, voiceId);
    
            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${BASE_URL}/text-to-speech/${voiceId}`,
                expect.objectContaining({
                    text: text,
                }),
                expect.objectContaining({
                    headers: {
                        Accept: 'audio/mpeg',
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                })
            );
        });

        it('should include voice_settings when options are not null', async () => {
            await ElevenLabsApi.textToSpeech(apiKey, text, voiceId, options);
    
            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${BASE_URL}/text-to-speech/${voiceId}`,
                expect.objectContaining({
                    text: text,
                    voice_settings: {
                        stability: options.stability / 100.0,
                        similarity_boost: options.similarity_boost / 100.0,
                    },
                }),
                expect.objectContaining({
                    headers: {
                        Accept: 'audio/mpeg',
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                })
            );
        });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
