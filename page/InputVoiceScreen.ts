import {BaseCompositor} from "mzfw/device/UiCompositor";
import {IMEProps} from "./types/CommonPagePropTypes";
import {osImport} from "mzfw/zosx/internal";
import {ZeppMediaLibrary, ZeppMediaRecorder} from "./types/ZosMediaTypes";
import {ListItem, ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {statSync} from "mzfw/zosx/fs";

const media = osImport<ZeppMediaLibrary>("@zos/media", null);

class InputVoiceScreen extends ListView<IMEProps> {
  private recorder: ZeppMediaRecorder = media.create(media.id.RECORDER);

  protected build(): (Component<any> | null)[] {
    this.startRecording();
    return [
      new ListItem({
        title: "Stop",
        onClick: () => {
          this.stopRecording();
        }
      })
    ]
  }

  private startRecording() {
    this.recorder.setFormat(media.codec.OPUS, {target_file: "voice.opus"});
    this.recorder.start();
    console.log("Recording started");
  }

  private stopRecording() {
    this.recorder.stop();
    console.log("Recording stopped");

    const stat = statSync({path: "voice.opus"});
    console.log(JSON.stringify(stat));
  }
}

Page(BaseCompositor.makePage(new InputVoiceScreen({id: "0", text: ""})));
