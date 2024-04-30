import {ListItem, ListView, SectionHeaderComponent} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {HeadlineButton} from "mzfw/device/UiButton";
import {getText as t} from "mzfw/zosx/i18n";
import {push, replace} from "mzfw/zosx/router";
import {AiChatTheme} from "./shared/AiChatTheme";
import {ConfigStorage} from "mzfw/device/Path";
import {ChatListRecord} from "./types/ConfigStorageTypes";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {
  IS_BAND_7,
  IS_SMALL_SCREEN_DEVICE,
  SCREEN_HEIGHT,
  SCREEN_MARGIN,
  SCREEN_WIDTH,
  WIDGET_WIDTH
} from "mzfw/device/UiProperties";
import {createImeSelectBar} from "./shared/createImeSelectBar";
import {align} from "mzfw/zosx/ui";
import {ImageComponent} from "mzfw/device/UiNativeComponents/UiImageComponent";
import {ServerNewsEntry} from "./types/ServerResponse";
import {rmSync} from "mzfw/zosx/fs";
import {TextLayoutProvider} from "mzfw/device/System/TextLayoutProvider";
import {UiDrawRectangleComponent} from "mzfw/device/UiNativeComponents";

type HomePageParams = {
  isOnline: boolean,
  news: ServerNewsEntry | null,
}

class HomePageScreen extends ListView<HomePageParams> {
  public theme = new AiChatTheme();
  public hideStatusBar: boolean = true;
  protected listViewTopOffset = SCREEN_HEIGHT;
  protected overrideHeaderHeight: number | null = 24;
  private chatListStorage = new ConfigStorage("chat_list.json");

  /**
   * Build headline page
   * @protected
   */
  protected beforeListViewRender() {
    if(!this.props.isOnline)
      return this.showOfflinePage();

    // Text
    const titleText = t("Ask your question here");
    const infoText = t("Or scroll down to view previous dialogs");

    // Sizes
    const margin = IS_SMALL_SCREEN_DEVICE ? 16 : 24;
    const infoTextSize = this.theme.FONT_SIZE - (IS_BAND_7 ? 4 : 8);
    const titleTextSize = this.theme.FONT_SIZE;
    const infoHeight = TextLayoutProvider.getHeightOf(infoText, SCREEN_WIDTH, infoTextSize);
    const titleHeight = TextLayoutProvider.getHeightOf(titleText, SCREEN_WIDTH, titleTextSize);

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

    // Calculate y for text's
    const textBoxY = headlineHeight + margin;
    const textBoxHeight = Math.floor((SCREEN_HEIGHT - textBoxY - imeBarHeight - margin) / 2);

    // Main title
    this.configureHeadComponent(new TextComponent({
      text: titleText,
      color: 0xFFFFFF,
      textSize: this.theme.FONT_SIZE,
      alignH: align.CENTER_H,
      alignV: align.BOTTOM,
    }), textBoxY, textBoxHeight - 4);

    // Info text
    this.configureHeadComponent(new TextComponent({
      text: infoText,
      color: 0xAAAAAA,
      textSize: this.theme.FONT_SIZE - (IS_BAND_7 ? 4 : 8),
      alignH: align.CENTER_H,
      alignV: align.TOP,
    }), textBoxY + textBoxHeight + 4, textBoxHeight)
  }

  /**
   * No internet warning banner
   * @private
   */
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

  /**
   * Add component outside ListView
   *
   * @param component
   * @param y
   * @param height
   * @private
   */
  private configureHeadComponent(component: Component<any>, y: number, height: number | null = null) {
    component.attachParent(this);
    component.setGeometry(null, null, WIDGET_WIDTH, null);

    const ph = height ?? component.geometry.h;
    const py = y >= 0 ? y : SCREEN_HEIGHT - ph + y;
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
      this.createNewsView(),
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
      components.push(this.createChatEntryView(chats[i]));

    if(end == chats.length && (components.length > 0 || page == 0)) {
      // Add pre-footer
      components.push(this.createFooterNoticeView(chats.length == 0))
    }

    return Promise.resolve(components);
  }

  /**
   * Create news view list item
   * @private
   */
  private createNewsView(): Component<any> | null {
    if(!this.props.news || localStorage.getItem("dismissNewsId") == this.props.news.id.toString())
      return null;

    return new ListItem({
      icon: "news",
      title: this.props.news.title,
      onClick: () => push({
        url: "page/NewsViewScreen",
        params: JSON.stringify({news: this.props.news}),
      }),
      secondActionName: t("Hide"),
      onSecondActionClick: () => {
        localStorage.setItem("dismissNewsId", this.props.news.id.toString());
        (localStorage as ConfigStorage).writeChanges();
        replace({url: "page/HomePageScreen", params: JSON.stringify(this.props)});
      }
    });
  }

  /**
   * Get text for pre-footer message
   *
   * @param noChats If true, will show suggestion to start a new chat
   * @private
   */
  private createFooterNoticeView(noChats: boolean): Component<any> {
    return new TextComponent({
      text: t(noChats
        ? "There's no started chats. Use button above to start new one."
        : "Swipe chat from right to left to delete."
      ),
      textSize: this.theme.FONT_SIZE - 2,
      color: 0xAAAAAA,
      alignH: align.CENTER_H,
      marginV: 8,
    });
  }

  /**
   * Will create a new chat ListItem
   *
   * @param record Record info
   * @private
   */
  private createChatEntryView(record: ChatListRecord): ListItem {
    return new ListItem({
      title: record.name,
      icon: "chat",

      onClick: () => push({
        url: "page/ChatViewScreen",
        params: JSON.stringify({id: record.id})
      }),

      secondActionName: t("Delete"),
      onSecondActionClick: () => {
        // Delete record
        let chats: ChatListRecord[] = this.chatListStorage.getItem("chats") ?? [];
        chats = chats.filter((r) => r.id != record.id);
        this.chatListStorage.setItem("chats", chats);
        this.chatListStorage.writeChanges();

        // Delete file
        rmSync(`${record.id}.json`);

        // Reload
        replace({url: "page/HomePageScreen", params: JSON.stringify(this.props)});
      }
    });
  }
}

Page(HomePageScreen.makePage(new HomePageScreen({isOnline: false, news: null})));
