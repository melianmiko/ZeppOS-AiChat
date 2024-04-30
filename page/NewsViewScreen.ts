import {ListView} from "mzfw/device/UiListView";
import {ServerNewsEntry} from "./types/ServerResponse";
import {Component} from "mzfw/device/UiComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import { AiChatTheme } from "./shared/AiChatTheme";

type NewsViewScreemProps = {
  news: ServerNewsEntry | null
};

class NewsViewScreen extends ListView<NewsViewScreemProps> {
  public theme = new AiChatTheme();

  protected build(): (Component<any> | null)[] {
    const entry = this.props.news;
    if(!entry) return [];

    localStorage.setItem("dismissNewsId", entry.id.toString());
    return [
      new TextComponent({
        text: entry.title,
        textSize: this.theme.FONT_SIZE + 2,
        marginV: 8,
      }),
      new TextComponent({
        text: entry.message,
        color: 0xAAAAAA,
      }),
    ]
  }
}

Page(ListView.makePage(new NewsViewScreen({news: null})));
