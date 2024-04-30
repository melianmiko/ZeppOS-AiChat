import {TemplateFontSettings} from "mzfw/device/TemplateFontSettings";
import {AiChatTheme} from "./shared/AiChatTheme";
import {getText} from "mzfw/zosx/i18n";

class SettingsFontSizeScreen extends TemplateFontSettings {
  public theme = new AiChatTheme();

  protected i18n(key: string): string {
    return getText(key);
  }
}

Page(TemplateFontSettings.makePage(new SettingsFontSizeScreen({})));
