import {ScreenBoardConfigScreen} from "mzfw/device/ScreenBoardConfigScreen";
import {AiChatTheme} from "./shared/AiChatTheme";
import {getText} from "mzfw/zosx/i18n";

class SettingsKeyboardScreen extends ScreenBoardConfigScreen {
  public theme = new AiChatTheme();

  i18n(key: string): string {
    return getText(key);
  }
}

Page(ScreenBoardConfigScreen.makePage(new SettingsKeyboardScreen({})));
