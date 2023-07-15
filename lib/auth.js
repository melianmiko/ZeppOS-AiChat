function makeCRC32Table(polynom=0xD5828281) {
  let table = new Uint32Array(256), fwd;
  for(let i = 0; i < 256; i++) {
    fwd = i;
    for(let j = 8; j > 0; j--) {
      if ((fwd & 1) === 1)
        fwd = (fwd >>> 1) ^ polynom;
      else
        fwd >>>= 1;
    }
    table[i] = fwd & 0xffffffff;
  }
  return table;
}

const defaultTable = makeCRC32Table()

function CRC32(data, table=defaultTable) {
  let crc = 0xFFFFFFFF;
  for(const c of data)
    crc = (crc >>> 8) ^ table[(crc ^ c) & 0xff];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function getTbaToken(key) {
  key[0] = Math.floor(Date.now() / 1000 / 60 / 60);
  return CRC32(key);
}
