import { NetworkWriter } from "./NetworkWriter";

describe('NetworkWriter', () => {
    it('should write correct number of bits and value', () => {
        const writer = new NetworkWriter(1200, false);
        writer.write(BigInt(25), 8);

        var view = writer.GetSegment();

        // 1 byte
        expect(view.byteLength).toBe(1);
        expect(view[0]).toBe(25);
        // add assertions here
    });

    it('can write multiple bytes', () => {
        const writer = new NetworkWriter(1200, false);
        const count = 20;
        for (let i = 0; i < count; i++) {
            writer.write(BigInt(i + 1), 8);
        }

        const view = writer.GetSegment();
        expect(view.byteLength).toBe(count);
        for (let i = 0; i < count; i++) {
            expect(view[i]).toBe(i + 1);
        }
    });

    it('can write part of a bit', () => {
        const writer = new NetworkWriter(1200, false);
        const value = 0b0110_1010;
        writer.write(BigInt(0), 60);
        writer.write(BigInt(value), 8);

        const view = writer.GetSegment();
        expect(view.byteLength).toBe(9);// really it is 8.5, but should round up
        const part1 = view[7];
        const part2 = view[8];
        const outValue = ((part1 & 0b1111_0000) >> 4) | ((part2 & 0b0000_1111) << 4);
        expect(outValue).toBe(value);
    });
});