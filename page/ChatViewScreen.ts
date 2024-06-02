import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {TextComponent, TextComponentProps} from "mzfw/device/UiTextComponent";
import {createImeSelectBar} from "./shared/createImeSelectBar";
import {ChatMessageRecord} from "./types/ConfigStorageTypes";
import {ConfigStorage} from "mzfw/device/Path";
import {SERVER_BASE_URL} from "./shared/constants";
import {align} from "@zosx/ui";
import {ActionBar} from "mzfw/device/UiActionBar";
import {replace} from "@zosx/router";
import {getText as t} from "@zosx/i18n";
import {resetPageBrightTime, setPageBrightTime} from "@zosx/display";
import { AiChatTheme } from "./shared/AiChatTheme";

type ChatViewScreenProps = {
  id: string
}

class ChatViewScreen extends ListView<ChatViewScreenProps> {
  public theme = new AiChatTheme();
  public renderDirection: 1 | -1 = -1;

  private storage?: ConfigStorage;
  private messages: ChatMessageRecord[] = [];
  private lastMessage?: TextComponent;
  private partial?: ChatMessageRecord;
  private chatLocked: boolean = false;

  protected build(): (Component<any> | null)[] {
    setPageBrightTime({brightTime: 60000});

    this.storage = new ConfigStorage(this.props.id + ".json");
    this.messages = (this.storage.getItem("messages") ?? []).reverse();
    this.lastMessage = this.createMessageView(this.messages[0]);

    this.serverUpdateLoop();

    return [
      this.lastMessage,
    ]
  }

  performDestroy() {
    super.performDestroy();
    resetPageBrightTime();
  }

  protected buildMore(page: number): Promise<Component<any>[]> {
    const index = page + 1;
    if(index >= this.messages.length) return Promise.resolve([]);
    return Promise.resolve([this.createMessageView(this.messages[index])]);
  }

  private createMessageView(record: ChatMessageRecord): TextComponent {
    const cfg: TextComponentProps = {
      text: record.content,
      marginV: 4,
    }

    switch(record.role) {
      case "user":
        cfg.alignH = align.RIGHT;
        cfg.color = 0xAAAAAA;
        break;
      case "system":
        cfg.alignH = align.CENTER_H;
        cfg.color = this.theme.ACCENT_COLOR_DARK;
        cfg.textSize = this.theme.FONT_SIZE - 4;
        break;
      case "donate":
        cfg.alignH = align.CENTER_H;
        cfg.color = 0xF48FB1;
        cfg.textSize = this.theme.FONT_SIZE - 4;
        break;
      case "error":
        cfg.alignH = align.CENTER_H;
        cfg.color = 0xFF2222;
        cfg.textSize = this.theme.FONT_SIZE - 4;
    }

    return new TextComponent(cfg);
  }

  private serverUpdateLoop() {
    if(this.partial && this.partial.finish_reason !== null) {
      if(!this.messages[0].finish_reason) {
        this.messages[0] = this.partial;
        this.storage.setItem("messages", this.messages.reverse());
        this.storage.writeChanges();
      }
      return this.showActionBar();
    }

    fetch(`${SERVER_BASE_URL}/api/v2/chat/${this.props.id}/last`).then((r) => {
      if(r.status === 404) {
        this.chatLocked = true;
        this.partial = this.messages[0];
        return null;
      }

      if(r.status !== 200) {
        throw new Error(r.status == 0 ? "No internet" : `Server error, status=${r.status}`);
      }

      return r.json();
    }).then((data) => {
      if(data == null)
        return this.showActionBar();

      if(data.role === "error") {
        console.log("error message");
        console.log(data.content)
        this.showError(data.content);
        return;
      }

      this.partial = data;
      this.lastMessage.updateProps({text: data.content});
      this.serverUpdateLoop();
    }).catch((e) => {
      console.log(e);
      this.showError(String(e), e.message != "No internet");
    });
  }

  showError(e: string, allowRetry: boolean = true) {
    this.addComponent(this.createMessageView({role: "error", content: e}), 1);
    if(allowRetry) this.addComponent(new ActionBar({
      children: [
        {
          icon: "retry",
          onClick: () => replace({
            url: "page/InputKeyboardScreen",
            params: JSON.stringify({id: this.props.id, text: this.getLastUserMessage()}),
          })
        }
      ]
    }), 1);
  }

  private getLastUserMessage(): string {
    for(const record of this.messages)
      if(record.role == "user")
        return record.content;

    return "";
  }

  private showActionBar(): void {
    if(this.chatLocked)
      return this.addComponent(this.createMessageView({
        role: "system",
        content: t("This dialog closed due to timeout.")
      }), 1);
    this.addComponent(createImeSelectBar(this.props.id), 1);
  }
}

Page(ListView.makePage(new ChatViewScreen({id: "0"})))
