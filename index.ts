
const MAX_BYTES: number = 8;
const MAX: number = 255-MAX_BYTES+2;

let pow256 = [1, 256, 65536, 16777216, 4294967296, 1099511627776, 281474976710656, 72057594037927936];


function encodeToHelper(n: number, buffer: Buffer, offset: number = 0, l: number = encodingLength(n)): number {
    if (l === 1) {
        buffer[offset] = n;
    } else {
        let x: number = n - MAX;
        let byteIndex: number;
        for (byteIndex = 0; byteIndex < l; byteIndex++) {
            if (byteIndex === 0) 
                buffer[byteIndex] = MAX+l-2;
            else {
                let val = Math.floor(x / pow256[l-2-byteIndex+1]);
                if (byteIndex > 1) val = val%256;
                buffer[byteIndex] = val;
            }
        }    
    }
    return l;
}

export function encodeTo(n: number, buffer: Buffer, offset: number = 0): number {
    return encodeToHelper(n, buffer, offset)
}

export function encodingLength(n: number): number {
    if (n < MAX) return 1;
    let x: number = n - MAX;
    for (let i = 1; i < MAX_BYTES; i++) 
        if (x < pow256[i]) return i+1;
    throw Error("Number is too large to encode");    
}

export function encode(n: number): Buffer {
    let l = encodingLength(n);
    let buffer = Buffer.alloc(l);
    encodeToHelper(n, buffer, 0, l);
    return buffer;
}


export function maxValue(): number {
    return Math.min(Number.MAX_SAFE_INTEGER, 256 - MAX_BYTES + pow256[MAX_BYTES-1]);
}

export function decode(xs: Buffer, offset: number = 0): {value: number, byteLength: number} {
    let first: number = xs[offset];

    if (first < MAX) 
        return {
            value: first,
            byteLength: 1
        }    
    else {
        let byteLength: number = first-MAX+2;
        let result: number = MAX;
        for (let i = 1; i < byteLength; i++) {
            result += xs[i+offset]*pow256[byteLength-i-1];
        }
        return {
            value: result,
            byteLength: byteLength
        }
    }
}
