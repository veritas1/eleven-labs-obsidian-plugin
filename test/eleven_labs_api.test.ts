import axios from "axios";
import ElevenLabsApi from "../src/eleven_labs_api";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ElevenLabsApi", () => {
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
    });
});

afterEach(() => {
    jest.clearAllMocks();
});
