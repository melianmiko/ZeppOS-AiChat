import {IMEProps} from "./types/CommonPagePropTypes";
import {ScreenBoard} from "mzfw/device/ScreenBoard";
import {AiChatTheme} from "./shared/AiChatTheme";
import {getText as t} from "mzfw/zosx/i18n";
import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {SERVER_AUTH_KEY, SERVER_BASE_URL} from "./shared/constants";
import {getTbaToken, getSharedDeviceData} from "./shared/Tools";
import {saveNewMessageToFile} from "./shared/saveNewMessageToFile";
import {replace} from "mzfw/zosx/router";
import {showToast} from "mzfw/zosx/interaction";

class InputKeyboardScreen extends ListView<IMEProps> {
  private board: ScreenBoard | null = null;
  private lock: boolean = false;

  build(): Component<any>[] {
    this.board = new ScreenBoard({theme: new AiChatTheme()});
    this.board.title = t(this.props.id == "0" ? "Start dialog:" : "New message:");
    this.board.value = this.props.text ?? "";
    this.board.confirmButtonText = t("Send");
    this.board.onConfirm = (t: string) => this.sendMessage(t);
    this.board.visible = true;

    return [];
  }

  private sendMessage(message: string) {
    if(this.lock) return;

    this.board.confirmButtonText = t("Processing...");
    this.lock = true;

    // TODO: v2 API
    let status = 0;
    fetch(`${SERVER_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${getTbaToken(SERVER_AUTH_KEY)}`
      },
      body: JSON.stringify({
        context_id: this.props.id != "0" ? this.props.id : null,
        message,
        device: getSharedDeviceData()
      })
    }).then((r) => {
      status = r.status;
      return r.json();
    }).then((data) => {
      if(status !== 200) return this.onError(data, status);
      saveNewMessageToFile(data, message);
      replace({
        url: "page/ChatViewScreen",
        params: JSON.stringify({id: data.context_id})
      })
    })
  }

  private onError(data: any, status: number) {
    console.log(`ERR ${status} ${data}`);
    let message = "Unknown error";
    if(status === 429) message = "Too many requests";
    else if(data && data.error) message = data.error;

    showToast({content: message});

    this.board.confirmButtonText = t("Send");
    this.lock = false;
  }
}

Page(ListView.makePage(new InputKeyboardScreen({id: "", text: ""})));
