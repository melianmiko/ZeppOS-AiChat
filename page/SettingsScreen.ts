import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {getText as t} from "mzfw/zosx/i18n";
import {push} from "mzfw/zosx/router";
import {AiChatTheme} from "./shared/AiChatTheme";

class SettingsScreen extends ListView<any> {
  public theme = new AiChatTheme();

  protected build(): (Component<any> | null)[] {
    return [
      new ListItem({
        title: t("About..."),
        icon: "about",
        onClick: () => push({url: "page/AboutScreen"}),
      }),

      new SectionHeaderComponent(t("Settings:")),
      new ListItem({
        title: t("Font size..."),
        icon: "fontSize",
        onClick: () => push({url: "page/SettingsFontSizeScreen"}),
      }),
      new ListItem({
        title: t("Keyboard..."),
        icon: "keyboard",
        onClick: () => push({url: "page/SettingsKeyboardScreen"}),
      }),
      new ListItem({
        title: t("Privacy warning..."),
        icon: "privacy",
        onClick: () => push({url: "page/PrivacyWarningScreen"}),
      }),
    ]
  }
}

Page(ListView.makePage(new SettingsScreen({})));
