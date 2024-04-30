import {gettext as t} from "i18n";
import {ConfiguredListScreen} from "../lib/ConfiguredListScreen";

class SettingsScreen extends ConfiguredListScreen {
    start() {
        this.row({
            text: t("About..."),
            icon: "menu/about.png",
            callback: () => hmApp.gotoPage({url: "page/AboutScreen"})
        });

        this.headline(t("Settings:"));
        this.row({
            text: t("Font size..."),
            icon: "menu/font_size.png",
            callback: () => hmApp.gotoPage({url: "page/FontSetupScreen"})
        });
        this.row({
            text: t("Keyboard..."),
            icon: "menu/keyboard.png",
            callback: () => hmApp.gotoPage({url: "page/ScreenBoardSetup"})
        });
        this.row({
            text: t("Privacy warning..."),
            icon: "menu/privacy.png",
            callback: () => hmApp.gotoPage({url: "page/PrivacyWarningScreen"})
        });
        this.offset();
    }
}

Page({
    onInit(param) {
        new SettingsScreen().start();
    }
})