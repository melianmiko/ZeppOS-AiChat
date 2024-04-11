import {DeviceInfo} from "mzfw/device/UiProperties";

export type DeviceInfoBundle = {
  id: string,
  name: string,
}

export function getSharedDeviceData(): DeviceInfoBundle {
  return {
    id: localStorage.getItem("device_id") ?? generateDeviceID(),
    name: DeviceInfo.deviceName,
  };
}

function generateDeviceID(): string {
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let length = 12;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  localStorage.setItem("device_id", result);
  return result;
}

function makeCRC32Table(polynomial: number = 0xD5828281) {
  let table = new Uint32Array(256), forward;
  for(let i = 0; i < 256; i++) {
    forward = i;
    for(let j = 8; j > 0; j--) {
      if ((forward & 1) === 1)
        forward = (forward >>> 1) ^ polynomial;
      else
        forward >>>= 1;
    }
    table[i] = forward & 0xffffffff;
  }
  return table;
}

const defaultTable = makeCRC32Table()

function CRC32(data: number[], table: Uint32Array= defaultTable) {
  let crc = 0xFFFFFFFF;
  for(const c of data)
    crc = (crc >>> 8) ^ table[(crc ^ c) & 0xff];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function getTbaToken(key: number[]) {
  key[0] = Math.floor(Date.now() / 1000 / 60 / 60);
  return CRC32(key);
}
