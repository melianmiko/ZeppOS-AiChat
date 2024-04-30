import {IS_BAND_7, SCREEN_HEIGHT, SCREEN_WIDTH} from "mzfw/device/UiProperties";
import {createWidget, setStatusBarVisible, widget} from "mzfw/zosx/ui";
import {ZeppFillRectWidgetOptions, ZeppImgWidgetOptions} from "mzfw/zosx/ui/WidgetOptionTypes";
import {
  getAutoBrightness,
  getBrightness,
  resetPageBrightTime,
  setAutoBrightness,
  setBrightness,
  setPageBrightTime
} from "mzfw/zosx/display";

type SavedUserSettings = {
  brightness: number,
  autoBrightness: boolean
}

const userSettings: SavedUserSettings = {
  brightness: 0,
  autoBrightness: false,
}

Page({
  build() {
    const imageFile = IS_BAND_7 ? "qr_small.png" : "qr_normal.png";
    const imageSize = IS_BAND_7 ? 174 : 297;

    createWidget<ZeppFillRectWidgetOptions>(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT,
      color: 0xFFFFFF,
    })
    createWidget<ZeppImgWidgetOptions>(widget.IMG, {
      x: Math.floor((SCREEN_WIDTH - imageSize) / 2),
      y: Math.floor((SCREEN_HEIGHT - imageSize) / 2),
      src: imageFile,
    });

    userSettings.autoBrightness = getAutoBrightness();
    userSettings.brightness = getBrightness();
    setStatusBarVisible(false);
    setBrightness({brightness: 100});
    setAutoBrightness({autoBright: false});
    setPageBrightTime({brightTime: 60 * 1000});
  },
  onDestroy() {
    setStatusBarVisible(true);
    setBrightness({brightness: userSettings.brightness});
    setAutoBrightness({autoBright: userSettings.autoBrightness});
    resetPageBrightTime();
  }
})