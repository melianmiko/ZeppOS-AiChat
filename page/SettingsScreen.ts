import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {getText as t} from "@zosx/i18n";
import {push} from "@zosx/router";
import {AiChatTheme} from "./shared/AiChatTheme";
import {SERVER_BASE_URL} from "./shared/constants";
import {getRequestHeaders} from "./shared/Tools";
import {ServerLimitsResponse} from "./types/ServerResponse";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {align} from "@zosx/ui";

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

  protected buildMore(page: number): Promise<Component<any>[]> {
    if(page > 0)
      return Promise.resolve([]);

    const limitNames = {
      "total": t("Messages (total):"),
      "voice": t("Voice requests:")
    }

    return fetch(`${SERVER_BASE_URL}/api/v2/my_limits`, {headers: getRequestHeaders()}).then((r) => {
      if(r.status != 200) return null;
      return r.json();
    }).then((d: ServerLimitsResponse) => {
      if(d == null) return [];
      let limitsInfo: string = "";
      for(const tag in limitNames) {
        if(!d.limits[tag]) continue;
        limitsInfo += limitNames[tag] + " " + (d.usage[tag] ?? 0) + "/" + d.limits[tag] + "\n";
      }

      return [
        new SectionHeaderComponent(t("Daily limits:")),
        new TextComponent({
          text: limitsInfo,
          textSize: this.theme.FONT_SIZE - 2,
          alignH: align.CENTER_H,
          marginV: 4,
        }),
      ]
    })
  }
}

Page(ListView.makePage(new SettingsScreen({})));
