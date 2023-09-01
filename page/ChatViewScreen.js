import {Path} from "../lib/mmk/Path";
import {SERVER} from "../lib/constants";
import {SCREEN_HEIGHT, SCREEN_MARGIN_Y} from "../lib/mmk/UiParams";
import {gettext as t} from "i18n";
import {ConfiguredListScreen} from "../lib/ConfiguredListScreen";
import {TouchEventManager} from "../lib/mmk/TouchEventManager";

const { fetch } = getApp()._options.globalData;

class ChatViewScreen extends ConfiguredListScreen {
    constructor(p) {
        super();
        this.params = JSON.parse(p);
        this.file = new Path("data", `${this.params.context_id}.json`);
        this.partial = {finish_reason: null};
        this.lastMessageView = null;
        this.lastLayerY = null;
        this.downOffset = SCREEN_MARGIN_Y;

        try {
            this.data = this.file.fetchJSON();
        } catch (e) {
            this.data = [];
        }
    }

    start() {
        let last, body;
        for(let i = 0; i < this.data.length; i++) {
            body = this.data[i];
            last = this.message(body, body.role === "assistant" && i !== this.data.length - 1);
        }
        this.scrollDown();

        // Begin partial renew
        this.lastMessageView = last;
        this.chatLocked = false;
        this.partialFetchLoop();
    }

    scrollDown() {
        if(this.lastLayerY !== null && this.lastLayerY !== hmApp.getLayerY()) return;
        this.lastLayerY = SCREEN_HEIGHT - this.positionY - this.downOffset
        hmApp.setLayerY(this.lastLayerY);
    }

    buildFooter() {
        this.downOffset = 0;

        switch (this.partial.finish_reason) {
            case "length":
                this.message({role: "system", content: t("Stop due to length limit...")});
                break;
            case "stop":
                break;
        }

        if(!this.chatLocked) {
            this.offset(16);
            this.row({
                text: t("Message..."),
                icon: "menu/message.png",
                callback: () => hmApp.reloadPage({
                    url: "page/KeyboardScreen",
                    param: JSON.stringify(this.params)
                })
            })
        } else {
            this.message({role: "system", content: t("This dialog closed due to timeout.")})
        }

        this.offset(SCREEN_MARGIN_Y);
        this.scrollDown();
    }

    partialFetchLoop() {
        if(this.partial.finish_reason !== null) {
            if(!this.data[this.data.length - 1].finish_reason) {
                this.data[this.data.length - 1] = this.partial;
                this.file.overrideWithJSON(this.data);
            }
            return this.buildFooter();
        }

        fetch(`${SERVER}/chat/${this.params.context_id}/last`).then((r) => {
            if(r.status === 404) {
                this.chatLocked = true;
                this.partial = this.data[this.data.length - 1];
                return null;
            }
            if(r.status !== 200) {
                throw new Error(`Server error, status=${r.status}`);
            }

            return r.json();
        }).then((data) => {
            if(data == null) return this.buildFooter();

            if(data.role === "error") {
                console.log("error message");
                console.log(data.content)
                this.message({role: "error", content: data.content})
                this.scrollDown();
                return;
            }

            this.partial = data;
            this.lastMessageView.setText(data.content);
            this.scrollDown();
            this.partialFetchLoop();
        }).catch((e) => {
            console.log(e);
            this.message({role: "error", content: String(e)})
            this.scrollDown();
        });
    }

    message(obj, compact) {
        const {role, content} = obj;
        const cfg = {
            text: compact && content.length > 30 ? `${content.substring(0, 30)}...` : content,
            bottomOffset: 4,
            topOffset: 4,
        };

        switch(role) {
            case "user":
                cfg.align = hmUI.align.RIGHT;
                cfg.color = 0xAAAAAA;
                break;
            case "system":
                cfg.align = hmUI.align.CENTER_H;
                cfg.color = 0x0099FF;
                cfg.fontSize = this.fontSize - 4;
                break;
            case "donate":
                cfg.align = hmUI.align.CENTER_H;
                cfg.color = 0xF48FB1;
                cfg.fontSize = this.fontSize - 4;
                break;
            case "error":
                cfg.align = hmUI.align.CENTER_H;
                cfg.color = 0xFF2222;
                cfg.fontSize = this.fontSize - 4;
        }

        const view = this.text(cfg);
        const event = new TouchEventManager(view.widget);
        event.ontouch = () => {
            if(!compact) return;
            view.setText(content);
            compact = false;
        };

        return view;
    }
}

Page({
    onInit(param) {
        hmSetting.setBrightScreen(600);
        new ChatViewScreen(param).start();
    },
    onDestroy() {
        hmSetting.setBrightScreenCancel();
    }
})