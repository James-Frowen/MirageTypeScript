
export const MAX_UINT64 = BigInt(0xFFFF_FFFF_FFFF_FFFFn);

export class BitMask {
    // shift functions that work same way as c#
    public static shiftLeft(value:bigint, shift:bigint) :bigint {
        return (value << (shift & 0b11_1111n)) & MAX_UINT64;
    }
    public static shiftRight(value:bigint, shift:bigint) :bigint {
        return (value >> (shift & 0b11_1111n)) & MAX_UINT64;
    }
    
    public static maskPosition(value :number):bigint {
        return BigInt(value) & 0b11_1111n
    }

    public static outerMask(start: bigint, end: bigint): bigint {
        return this.shiftLeft(MAX_UINT64, start) ^ this.shiftRight(MAX_UINT64, 64n-end);
    }

    public static mask(bits: number): bigint {
        if (bits === 0)
            return 0n;

        return MAX_UINT64 >> BigInt(64 - bits);
    }
}

