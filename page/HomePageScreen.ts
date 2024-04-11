import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {HeadlineButton} from "mzfw/device/UiButton";
import {getText as t} from "mzfw/zosx/i18n";
import {push} from "mzfw/zosx/router";
import {AiChatTheme} from "./shared/AiChatTheme";
import {ConfigStorage} from "mzfw/device/Path";
import {ChatListRecord} from "./types/ConfigStorageTypes";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {IS_BAND_7, IS_SMALL_SCREEN_DEVICE, SCREEN_HEIGHT, SCREEN_MARGIN, WIDGET_WIDTH} from "mzfw/device/UiProperties";
import {createImeSelectBar} from "./shared/createImeSelectBar";
import {align} from "mzfw/zosx/ui";
import {ImageComponent} from "mzfw/device/UiNativeComponents/UiImageComponent";

type HomePageParams = {
  isOnline: boolean,
}

class HomePageScreen extends ListView<HomePageParams> {
  public theme = new AiChatTheme();
  public hideStatusBar: boolean = true;
  protected listViewTopOffset = SCREEN_HEIGHT;
  protected overrideHeaderHeight: number | null = 24;
  private chatListStorage = new ConfigStorage("chat_list.json");

  protected beforeListViewRender() {
    if(!this.props.isOnline)
      return this.showOfflinePage();
    const margin = IS_SMALL_SCREEN_DEVICE ? 16 : 24;

    // Headline settings button
    const headlineHeight = this.configureHeadComponent(new HeadlineButton({
      text: t("Settings..."),
      icon: "settings",
      onClick(): any {
        push({url: "page/SettingsScreen"});
      },
    }), margin);

    // IME Select bar
    const imeBarHeight = this.configureHeadComponent(createImeSelectBar("0", false), -margin);

    // Info text
    this.configureHeadComponent(new TextComponent({
      text: t("Ask your question here, or scroll down to view previous dialogs"),
      color: this.theme.ACCENT_COLOR_LIGHT,
      textSize: this.theme.FONT_SIZE - (IS_BAND_7 ? 2 : 6),
      alignH: align.CENTER_H,
      alignV: align.BOTTOM,
    }), headlineHeight + (margin * 2), SCREEN_HEIGHT - headlineHeight - imeBarHeight - (margin * 4))
  }

  private showOfflinePage() {
    this.configureHeadComponent(new ImageComponent({
      src: "icon/80/offline.png",
      imageWidth: 80,
      imageHeight: 80,
    }), 0, SCREEN_HEIGHT / 2);
    this.configureHeadComponent(new TextComponent({
      text: t("No internet connection.\nScroll down to view previous dialogs."),
      textSize: this.theme.FONT_SIZE - 2,
      alignH: align.CENTER_H,
      alignV: align.TOP,
    }), SCREEN_HEIGHT / 2, SCREEN_HEIGHT / 2)
  }

  private configureHeadComponent(component: Component<any>, y: number, height: number | null = null) {
    component.attachParent(this);
    component.setGeometry(null, null, WIDGET_WIDTH, null);

    const ph = height ?? component.geometry.h;
    const py = y > 0 ? y : SCREEN_HEIGHT - ph + y;
    component.setGeometry(SCREEN_MARGIN, py, WIDGET_WIDTH, ph);
    component.performRender();

    this.nestedComponents.push(component);

    return component.geometry.h;
  }

  /**
   * Build base page contents
   * @protected
   */
  protected build(): (Component<any> | null)[] {
    return [
      // TODO: Fetch news (v2 api)

      // Chats list headline
      new SectionHeaderComponent(t("Chats:")),
    ];
  }

  /**
   * Dynamic load chats list.
   *
   * @param page Current page number
   * @protected
   */
  protected buildMore(page: number): Promise<Component<any>[]> {
    const chats: ChatListRecord[] = this.chatListStorage.getItem("chats") ?? [];

    const end = Math.min((page + 1) * 10, chats.length);
    const components: Component<any>[] = [];
    for(let i = page * 10; i < end; i++)
      components.push(this.createChatListItem(chats[i]));

    if(end == chats.length && (components.length > 0 || page == 0)) {
      // Add pre-footer
      components.push(new TextComponent({
        text: this.getFooterText(chats.length == 0)
      }))
    }

    return Promise.resolve(components);
  }

  /**
   * Get text for pre-footer message
   *
   * @param noChats If true, will show suggestion to start a new chat
   * @private
   */
  private getFooterText(noChats: boolean) {
    return "sus";
  }

  /**
   * Will create a new chat ListItem
   * @param record Record info
   * @private
   */
  private createChatListItem(record: ChatListRecord): ListItem {
    return new ListItem({
      title: record.name,
      icon: "chat",
      onClick: () => push({
        url: "page/ChatViewScreen",
        params: JSON.stringify({id: record.id})
      }),
    });
  }
}

Page(HomePageScreen.makePage(new HomePageScreen({isOnline: false})));
