import { DEFAULT_SETTINGS } from "../src/settings";

describe("default settings", () => {
    it("should set api key to empty string", () => {
        expect(DEFAULT_SETTINGS.apiKey).toBe("");
    });

    it("should set selected voice id to null", () => {
        expect(DEFAULT_SETTINGS.selectedVoiceId).toBe(null);
    });

    it("should set voice settings to empty object", () => {
        expect(DEFAULT_SETTINGS.voiceSettings).toStrictEqual({});
    });
});
