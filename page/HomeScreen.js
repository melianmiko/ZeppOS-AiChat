import {gettext as t} from "i18n";
import {Path} from "../lib/mmk/Path";
import {ConfiguredListScreen} from "../lib/ConfiguredListScreen";

const { config } = getApp()._options.globalData;

class HomeScreen extends ConfiguredListScreen {
  start() {
    hmUI.setStatusBarVisible(true);
    hmUI.updateStatusBarTitle("Chat");

    this.twoActionBar([
      {
        text: t("Settings..."),
        icon: "menu/settings.png",
        callback: () => {
          hmApp.gotoPage({
            url: "page/SettingsScreen",
          })
        }
      },
      {
        text: t("New chat..."),
        icon: "menu/message.png",
        callback: () => {
          hmApp.gotoPage({
            url: config.get("privacy_confirm", false) ? "page/KeyboardScreen" : "page/PrivacyWarningScreen",
            param: "{}"
          })
        }
      }
    ]);

    const chats = config.get("chats", []);

    this.headline(t("Chats:"));
    for(const chat of chats) {
      this.createChatRow(chat)
    }

    this.text({
      text: chats.length > 0 ? t("Swipe chat from right to left to delete.") : t("There's no started chats. Use button above to start new one.")
    });
    this.offset();
  }

  createChatRow(data) {
    const {id, title} = data;
    this.row({
      text: title,
      icon: "menu/dialog.png",
      card: {
        hiddenButton: t("Delete"),
        hiddenButtonCallback: () => {
          const file = new Path('data', `${id}.json`);
          file.remove();
          const chats = config.get("chats", []).filter((o) => o.id !== id);
          config.set("chats", chats);

          hmApp.reloadPage({
            url: "page/HomeScreen"
          });
        },
      },
      callback: () => hmApp.gotoPage({
        url: "page/ChatViewScreen",
        param: JSON.stringify({context_id: id})
      })
    })
  }
}

Page({
  build() {
    new HomeScreen().start()
  }
})
