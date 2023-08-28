// import { Vault } from "../__mocks__/vault";
import { generateFilename } from "../../src/util/file";
import * as tzmock from "timezone-mock";

describe("generateFilename", () => {
    // New York timezone
    
    const data = [
        {
            timestamp: "2021-01-01T13:30:00.000Z",
            voice: "Dave",
        },
        {
            timestamp: "2020-12-31T18:59:59.000Z",
            voice: "Albert",
        },
        {
            timestamp: "1998-09-13T13:23:10.000Z",
            voice: "Claire",
        },
    ];
    
    const newYorkData: Map<string, string> = new Map();
    newYorkData.set(data[0].timestamp, `2021-01-01_08-30-00_${data[0].voice}`);
    newYorkData.set(data[1].timestamp, `2020-12-31_13-59-59_${data[1].voice}`);
    newYorkData.set(data[2].timestamp, `1998-09-13_09-23-10_${data[2].voice}`); // Summer time (EDT)
    
    it.each(data)("should return a filename", (data) => {
        tzmock.register("US/Eastern");
        const filename = generateFilename(data.voice, new Date(data.timestamp));
        expect(filename).toBe(newYorkData.get(data.timestamp));
    });

    const londonData: Map<string, string> = new Map();
    londonData.set(data[0].timestamp, `2021-01-01_13-30-00_${data[0].voice}`);
    londonData.set(data[1].timestamp, `2020-12-31_18-59-59_${data[1].voice}`);
    londonData.set(data[2].timestamp, `1998-09-13_14-23-10_${data[2].voice}`); // Summer time (BST)
    
    it.each(data)("should return a filename", (data) => {
        tzmock.register("Europe/London");
        const filename = generateFilename(data.voice, new Date(data.timestamp));
        expect(filename).toBe(londonData.get(data.timestamp));
    });

    const adelaideData: Map<string, string> = new Map();
    adelaideData.set(data[0].timestamp, `2021-01-02_00-00-00_${data[0].voice}`); // Summer time (ACDT)
    adelaideData.set(data[1].timestamp, `2021-01-01_05-29-59_${data[1].voice}`); // Summer time (ACDT)
    adelaideData.set(data[2].timestamp, `1998-09-13_22-53-10_${data[2].voice}`);
    
    it.each(data)("should return a filename", (data) => {
        tzmock.register("Australia/Adelaide");
        const filename = generateFilename(data.voice, new Date(data.timestamp));
        expect(filename).toBe(adelaideData.get(data.timestamp));
    });
});
