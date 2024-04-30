import {UiTheme} from "mzfw/device/UiCompositor";

export class AiChatTheme extends UiTheme {
  ACCENT_COLOR = 0x8BC34A;
  ACCENT_COLOR_DARK = 0x4c6e39
  ACCENT_COLOR_LIGHT = 0xAED581;

  constructor(useFontSetting: boolean = true) {
    super({useFontSetting: useFontSetting});
  }
}
