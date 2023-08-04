import {Path} from "./mmk/Path";
import {deviceName} from "./mmk/DeviceIdentifier";

export function getDeviceInfo() {
    let data = {};

    let file = new Path("data", "uid.json");
    try {
        data = file.fetchJSON();
    } catch(e) {
        data.id = generateDeviceID();
        data.name = deviceName;
        file.overrideWithJSON(data);
    }

    return data;
}

function generateDeviceID() {
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
    return result;
}
