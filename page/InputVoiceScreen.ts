import {BaseCompositor} from "mzfw/device/UiCompositor";
import {IMEProps} from "./types/CommonPagePropTypes";
import {osImport} from "mzfw/zosx/internal";
import {ZeppMediaLibrary, ZeppMediaRecorder} from "./types/ZosMediaTypes";
import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {closeSync, O_RDONLY, openSync, readSync, rmSync, statSync} from "mzfw/zosx/fs";
import {ImageComponent} from "mzfw/device/UiNativeComponents/UiImageComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {getText as t} from "mzfw/zosx/i18n";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {SERVER_BASE_URL} from "./shared/constants";
import {getRequestHeaders} from "./shared/Tools";
import {ServerChatResponse, ServerLimitsResponse} from "./types/ServerResponse";
import {saveNewMessageToFile} from "./shared/saveNewMessageToFile";
import {replace} from "mzfw/zosx/router";
import {align} from "mzfw/zosx/ui";
import TimeoutID = setTimeout.TimeoutID;

const media = osImport<ZeppMediaLibrary>("@zos/media", null);

class InputVoiceScreen extends ListView<IMEProps> {
  private recorder: ZeppMediaRecorder | null = null;
  private recorderTimeout: TimeoutID | null = null;

  private viewText = new TextComponent({
    text: t("Preparing..."),
    alignH: align.CENTER_H,
    marginV: 16,
  });
  private finishButton = new Button({
    text: "Send",
    variant: ButtonVariant.DEFAULT,
    onClick: () => this.stopRecording(),
  })

  /**
   * Shows icon in top of page
   * @protected
   */
  protected buildHeader(): Component<any> | null {
    return new ImageComponent({
      src: "icon/48/voice.png",
      imageWidth: 48,
      imageHeight: 48,
    });
  }

  /**
   * Build main UI
   * @protected
   */
  protected build(): (Component<any> | null)[] {
    return [
      this.viewText,
      this.finishButton,
    ]
  }

  /**
   * Validate limits and start recording
   */
  performRender() {
    super.performRender();

    // Check limits and start recording
    // TODO: Check firmware version
    fetch(`${SERVER_BASE_URL}/api/v2/my_limits`, {
      headers: getRequestHeaders()
    }).then((r) => {
      if (r.status != 200) return null;
      return r.json();
    }).then((d: ServerLimitsResponse) => {
      if (!d.limits.voice) {
        this.viewError(t("Rate limit reacted."));
        return;
      }
      this.startRecording();
    }).catch((e) => {
      console.log(e);
      this.viewError(t("Unknown error:") + e.toString());
    })
  }

  private startRecording() {
    // Delete file, if exists
    try {
      rmSync("voice.opus");
    } catch(_) {}

    // Start OS recorder
    this.recorder = media.create(media.id.RECORDER);
    this.recorder.setFormat(media.codec.OPUS, {target_file: "voice.opus"});
    this.recorder.start();

    // Update UI
    this.viewText.updateProps({text: t("Listening...")})
    this.recorderTimeout = setTimeout(() => {
      // Max recording time
      this.viewText.updateProps({text: t("Too long record. Hint: use Stop button when you finish your prompt.")})
      this.removeComponent(this.finishButton);
    }, 15000);
  }

  private stopRecording() {
    if (!this.recorder) return;

    // Stop OS recorder
    this.recorder.stop();
    clearTimeout(this.recorderTimeout);
    this.recorder = null;

    // Update UI
    this.removeComponent(this.finishButton);

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
      return this.viewText.updateProps({text: t("Failed: file not found")})

    const fd = openSync({path: "voice.opus", flag: O_RDONLY});
    const buffer = Buffer.alloc(stat.size);
    readSync({fd, buffer: buffer.buffer});
    closeSync(fd);

    this.viewText.updateProps({text: t("Processing...")});

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
    this.viewError(message);
  }

  private viewError(message: string) {
    this.viewText.updateProps({text: message});
    if(this.finishButton) {
      this.removeComponent(this.finishButton);
      this.finishButton = null;
    }
    // TODO: Error icon
  }
}

Page(BaseCompositor.makePage(new InputVoiceScreen({id: "0", text: ""})));
