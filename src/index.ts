import { NetworkWriter } from "./NetworkWriter";

const writer = new NetworkWriter(1200, false);
const value = 0b0110_1010;
writer.write(BigInt(0), 60);
writer.write(BigInt(value), 8);

const view = writer.GetSegment();
console.log(view.byteLength);

const part1 = view[7];
const part2 = view[8];
const outValue = ((part1 & 0b1111_0000) >> 4) | ((part2 & 0b0000_1111) << 4);
console.log(outValue);