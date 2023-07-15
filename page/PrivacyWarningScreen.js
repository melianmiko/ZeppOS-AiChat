import {gettext as t} from "i18n";
import {ConfiguredListScreen} from "../lib/ConfiguredListScreen";

const { config } = getApp()._options.globalData;

class WarningScreen extends ConfiguredListScreen {
    start() {
        this.text({
            text: t("Before using this app..."),
            color: 0xFF9900,
            fontSize: this.fontSize + 4,
            bottomOffset: 12,
        });
        this.text({
            text: t("All data that you provide to this application will be sent to OpenAI to proceed with GPT-3 AI model. " +
                "Keep in mind that all conversions may be used by OpenAI team to train next generations of ChatGPT. Do not share " +
                "any personal or secret information with ChatGPT."),
            bottomOffset: 8,
        });
        this.text({
            text: t("Also, keep in mind that ChatGPT isn't totally perfect, and it can generate incorrect information, " +
                "may produce offensive or biased content. Developer of \"AI-Chat\" only provide access to ChatGPT, and didn't " +
                "responsible for any content that is generated with this tool."),
            bottomOffset: 8,
        });
        this.text({
            text: t("Continue only of you agree with all of this"),
            color: 0x999999,
            bottomOffset: 24,
        });
        this.row({
            text: t("Continue"),
            icon: "menu/message.png",
            callback: () => {
                config.set("privacy_confirm", true);
                hmApp.reloadPage({url: "page/KeyboardScreen", param: '{}'});
            }
        });
        this.offset()
    }
}

Page({
    onInit(param) {
        new WarningScreen().start();
    }
})