import {gettext as t} from "i18n";
import {ScreenBoard} from "../lib/mmk/ScreenBoard";
import {Path} from "../lib/mmk/Path";
import {SERVER, SERVER_AUTH_KEY} from "../lib/constants";
import {getTbaToken} from "../lib/auth";

const { fetch, config } = getApp()._options.globalData;

class KeyboardScreen {
    constructor(props) {
        this.params = JSON.parse(props);
    }

    start() {
        this.board = new ScreenBoard();
        this.board.title = t(this.params.context_id ? "New message:" : "Start dialog:");
        this.board.confirmButtonText = t("Send");
        this.board.onConfirm = () => this.process();
    }

    process() {
        if(this.lock) return;
        hmSetting.setBrightScreen(60);

        this.lock = true;
        this.board.confirmButtonText = t("Processing...");

        fetch(`${SERVER}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${getTbaToken(SERVER_AUTH_KEY)}`
            },
            body: JSON.stringify({
                context_id: this.params.context_id ? this.params.context_id : null,
                message: this.board.value
            })
        }).then((r) => {
            if(r.status !== 200) {
                return hmUI.showToast({
                    text: "Server-side error..."
                })
            }
            return r.json();
        }).then((data) => {
            this.prepareFile(data.context_id);
            hmApp.reloadPage({
                url: "page/ChatViewScreen",
                param: JSON.stringify({context_id: data.context_id})
            })
        })
    }

    prepareFile(context_id) {
        const file = new Path("data", `${context_id}.json`);

        let data = [];
        try {
            data = file.fetchJSON();
        } catch (_) {}

        if(data.length === 0) {
            const chats = config.get("chats", []);
            chats.push({id: context_id, title: this.board.value.substring(0, 20)});
            config.set("chats", chats);
        }

        data.push({role: "user", content: this.board.value});
        data.push({role: "assistant", content: "..."});
        file.overrideWithJSON(data);
    }
}

Page({
    onInit(props) {
        new KeyboardScreen(props).start();
    }
})