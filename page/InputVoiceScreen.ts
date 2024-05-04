import {BaseCompositor} from "mzfw/device/UiCompositor";
import {IMEProps} from "./types/CommonPagePropTypes";
import {osImport} from "@zosx/utils";
import {ZeppMediaLibrary, ZeppMediaRecorder} from "./types/ZosMediaTypes";
import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {closeSync, O_RDONLY, openSync, readSync, rmSync, statSync} from "@zosx/fs";
import {ImageComponent} from "mzfw/device/UiNativeComponents/UiImageComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {getText as t} from "@zosx/i18n";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {SERVER_BASE_URL} from "./shared/constants";
import {getRequestHeaders} from "./shared/Tools";
import {ServerChatResponse, ServerVoicePrepareResponse} from "./types/ServerResponse";
import {saveNewMessageToFile} from "./shared/saveNewMessageToFile";
import {replace} from "@zosx/router";
import {align} from "@zosx/ui";
import {getSystemInfo} from "@zosx/settings";
import {resetPageBrightTime, setPageBrightTime} from "@zosx/display";
import TimeoutID = setTimeout.TimeoutID;
import { AiChatTheme } from "./shared/AiChatTheme";

const media = osImport<ZeppMediaLibrary>("@zos/media", null);

class InputVoiceScreen extends ListView<IMEProps> {
  public theme = new AiChatTheme();

  private recorder: ZeppMediaRecorder | null = null;
  private recorderTimeout: TimeoutID | null = null;

  private viewText = new TextComponent({
    text: t("Preparing..."),
    alignH: align.CENTER_H,
    marginV: 16,
  });
  private viewIcon: ImageComponent = new ImageComponent({
    src: "icon/60/preparing.png",
    imageWidth: 60,
    imageHeight: 60,
  });

  /**
   * Shows icon in top of page
   * @protected
   */
  protected buildHeader(): Component<any> | null {
    return this.viewIcon;
  }

  /**
   * Build main UI
   * @protected
   */
  protected build(): (Component<any> | null)[] {
    setPageBrightTime({brightTime: 60000});
    return [
      this.viewText,
    ]
  }

  performDestroy() {
    super.performDestroy();
    resetPageBrightTime();
  }

  /**
   * Validate limits and start recording
   */
  performRender() {
    super.performRender();

    // Check limits and start recording
    fetch(`${SERVER_BASE_URL}/api/v2/voice/prepare`, {
      headers: {
        ...getRequestHeaders(),
        "Device-Firmware": getSystemInfo().firmwareVersion,
      }
    }).then((r) => {
      if (r.status != 200 && r.status != 401) {
        this.onRequestError(null, r.status);
        return null;
      }

      return r.json();
    }).then((d: ServerVoicePrepareResponse) => {
      if(!d) return;
      if (!d.result) {
        this.updateView(t(d.error));
        if(d.requiredFirmware)
          this.viewMinFirmware(d.requiredFirmware);
        return;
      }

      this.startRecording();
    }).catch((e) => {
      console.log(e);
      this.updateView(t("Unknown error:") + e.toString());
    });
  }

  /**
   * Start voice recording
   * @private
   */
  private startRecording() {
    // Delete file, if exists
    try {
      rmSync("voice.opus");
    } catch(_) {}

    // Start OS recorder
    this.recorder = media.create(media.id.RECORDER);
    this.recorder.setFormat(media.codec.OPUS, {target_file: "voice.opus"});
    this.recorder.start();

    // Max record time limit
    const timeout = setTimeout(() => {
      // Max recording time
      this.updateView(t("Too long record. Hint: use Send button when you finish your prompt."), "timeout");
      this.removeComponent(button);
    }, 15000);

    // Update UI
    this.updateView(t("Listening..."), "recording");

    const button = new Button({
      text: t("Send"),
      variant: ButtonVariant.PRIMARY,
      onClick: () => {
        this.removeComponent(button);
        clearTimeout(timeout);
        this.stopRecording();
      }
    });
    this.addComponent(button);
  }

  private stopRecording() {
    if (!this.recorder) return;

    // Stop OS recorder
    this.recorder.stop();
    clearTimeout(this.recorderTimeout);
    this.recorder = null;

    // Continue
    this.sendRequest();
  }

  /**
   * Will send recorded audio file to server and create new dialog
   * @private
   */
  private sendRequest() {
    const stat = statSync({path: "voice.opus"});
    if(!stat || stat.size == 0)
      return this.updateView(t("Failed: file not found"));

    const fd = openSync({path: "voice.opus", flag: O_RDONLY});
    const buffer = Buffer.alloc(stat.size);
    readSync({fd, buffer: buffer.buffer});
    closeSync(fd);

    this.updateView(t("Processing..."), "loading");

    let status: number;
    fetch(`${SERVER_BASE_URL}/api/v2/chat`, {
      method: "POST",
      body: buffer,
      headers: {
        "Content-Type": "audio/ogg",
        "Context-ID": this.props.id ?? "0",
        ...getRequestHeaders(),
      },
    }).then((r) => {
      status = r.status;
      return (status == 0 || status >= 500) ? null : r.json();
    }).then((data: ServerChatResponse) => {
      if (status !== 200 || !data.result)
        return this.onRequestError(data, status);

      saveNewMessageToFile(data);
      replace({
        url: "page/ChatViewScreen",
        params: JSON.stringify({id: data.context_id})
      })
    })
  }

  /**
   * Handle server error
   *
   * @param data
   * @param status
   * @private
   */
  private onRequestError(data: ServerChatResponse, status: number) {
    console.log(`ERR ${status} ${data}`);
    let message = "Unknown error";
    if (status === 429) message = "Too many requests";
    else if (data && data.error) message = data.error;

    this.updateView(message);
  }

  private viewMinFirmware(minFirmware: string) {
    this.addComponent(new TextComponent({
      text: t("Min firmware version: ") + minFirmware + ".x.x",
      textSize: this.theme.FONT_SIZE - 4,
      color: 0xAAAAAA,
      alignH: align.CENTER_H,
      marginV: 16,
    }))
  }

  private updateView(message: string, icon: string = "warning") {
    this.viewText.updateProps({text: message});
    this.viewIcon.updateProps({src: `icon/60/${icon}.png`})
  }
}

Page(BaseCompositor.makePage(new InputVoiceScreen({id: "0", text: ""})));
