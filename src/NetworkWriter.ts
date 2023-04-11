import { BitMask, MAX_UINT64 } from "./BitMask";

const MAX_BUFFER_SIZE = 1024 * 512;


export class NetworkWriter {
    private buffer: ArrayBuffer;
    private view: BigUint64Array;
    private bitPosition: number;
    private bitCapacity: number;
    private allowResize: boolean;

    constructor(initialSize: number, allowResize: boolean) {
        this.buffer = new ArrayBuffer(initialSize);
        this.view = new BigUint64Array(this.buffer);
        this.bitPosition = 0;
        this.bitCapacity = initialSize * 8;
        this.allowResize = allowResize;
    }

    public GetByteLength(): number {
        return (this.bitPosition + 0b111) >> 3;
    }

    public GetSegment(): Uint8Array {
        const view = new Uint8Array(this.buffer);
        return view.subarray(0, this.GetByteLength());
    }

    public write(value: bigint, bits: number) {
        if (bits === 0) return;
        // mask so we don't overwrite

        this.writerUnmasked(value & BitMask.mask(bits), bits);
    }

    private writerUnmasked(value: bigint, bits: number) {
        const newPosition = this.bitPosition + bits;
        this.checkCapacity(newPosition);

        const bitsInLong = BitMask.maskPosition(this.bitPosition);
        const bitsLeft = 64n - bitsInLong;

        if (bitsLeft >= bits) {
            const index = this.bitPosition >> 6;
            const currentValue = this.view[index];

            const mask = BitMask.outerMask(bitsInLong, BitMask.maskPosition(newPosition));
            const currentWithMask = (currentValue & mask);
            const newShift = BigInt(bitsInLong);
            const newWithMask = BitMask.shiftLeft(value, newShift) & MAX_UINT64; // mask to 64 bits just incase

            const newValue = currentWithMask | newWithMask;
            this.view[index] = newValue;
        } else {
            const index = this.bitPosition >> 6;
            const currentValue1 = this.view[index];
            const currentValue2 = this.view[index + 1];

            const mask1 = BitMask.shiftRight(MAX_UINT64, BigInt(bitsLeft));
            const mask2 = BitMask.shiftLeft(MAX_UINT64, BigInt(newPosition));
            const newValue1 = (currentValue1 & mask1) | (value << bitsInLong);
            const newValue2 = (currentValue2 & mask2) | (value >> bitsLeft);

            this.view[index] = newValue1;
            this.view[index + 1] = newValue2;
        }
        this.bitPosition = newPosition;
    }

    private checkCapacity(newLength: number) {
        if (newLength > this.bitCapacity) {
            if (this.allowResize) {
                this.resizeBuffer(newLength);
            } else {
                this.throwLengthOverCapacity(newLength);
            }
        }
    }

    private throwLengthOverCapacity(newLength: number) {
        throw new Error(`Can not write over end of buffer, new length ${newLength}, capacity ${this.bitCapacity}`);
    }

    private resizeBuffer(minBitCapacity: number) {
        // +7 to round up to next byte
        const minByteCapacity = (minBitCapacity + 7) / 8;
        let size = this.buffer.byteLength;
        while (size < minByteCapacity) {
            size *= 2;
            if (size > MAX_BUFFER_SIZE) {
                throw new Error(`Buffer size exceeds maximum allowed size of ${MAX_BUFFER_SIZE}`);
            }
        }

        const newBuffer = new ArrayBuffer(size);
        // copy from old buffer to new buffer
        new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));

        // set new buffer
        this.buffer = newBuffer;
        this.view = new BigUint64Array(this.buffer);
    }
}
