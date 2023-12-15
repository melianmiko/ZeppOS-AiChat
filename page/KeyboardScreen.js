import {gettext as t} from "i18n";
import {ScreenBoard} from "../lib/mmk/ScreenBoard";
import {Path} from "../lib/mmk/Path";
import {SERVER, SERVER_AUTH_KEY} from "../lib/constants";
import {getTbaToken} from "../lib/auth";
import {getDeviceInfo} from "../lib/deviceInfoExporter";

const { fetch, config } = getApp()._options.globalData;

class KeyboardScreen {
    constructor(props) {
        this.params = JSON.parse(props);
    }

    start() {
        this.board = new ScreenBoard();
        if(this.params.value) this.board.value = this.params.value;
        this.board.title = t(this.params.context_id ? "New message:" : "Start dialog:");
        this.board.confirmButtonText = t("Send");
        this.board.onConfirm = () => this.process();
    }

    process() {
        if(this.lock) return;
        hmSetting.setBrightScreen(60);

        this.lock = true;
        this.board.confirmButtonText = t("Processing...");

        let status;
        fetch(`${SERVER}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${getTbaToken(SERVER_AUTH_KEY)}`
            },
            body: JSON.stringify({
                context_id: this.params.context_id ? this.params.context_id : null,
                message: this.board.value,
                device: getDeviceInfo()
            })
        }).then((r) => {
            status = r.status;
            return r.json();
        }).then((data) => {
            if(status !== 200) return this.onError(data, status);
            this.prepareFile(data);
            hmApp.reloadPage({
                url: "page/ChatViewScreen",
                param: JSON.stringify({context_id: data.context_id})
            })
        })
    }

    onError(data, status) {
        console.log(`ERR ${status} ${data}`);
        let message = "Unknown error";
        if(status === 429) message = "Too many requests";
        else if(data && data.error) message = data.error;

        hmUI.showToast({text: message});

        this.board.confirmButtonText = t("Send");
        this.lock = false;
    }

    prepareFile(data) {
        const context_id = data.context_id;
        const file = new Path("data", `${context_id}.json`);

        let fileData = [];
        try {
            fileData = file.fetchJSON();
        } catch (_) {}

        if(fileData.length === 0) {
            const chats = config.get("chats", []);
            chats.push({id: context_id, title: this.board.value.substring(0, 20)});
            config.set("chats", chats);
        }

        fileData.push({role: "user", content: this.board.value});
        if(data.server_message) fileData.push(data.server_message);
        fileData.push({role: "assistant", content: "..."});
        file.overrideWithJSON(fileData);
    }
}

Page({
    onInit(props) {
        new KeyboardScreen(props).start();
    }
})