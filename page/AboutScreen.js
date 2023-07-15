import {BaseAboutScreen} from "../lib/mmk/BaseAboutScreen";
import {FsTools} from "../lib/mmk/Path";
import {gettext as t} from "i18n";
import {VERSION} from "../version";

class AboutScreen extends BaseAboutScreen {
  constructor() {
    super();

    this.appId = FsTools.getAppTags()[0];
    this.iconSize = 100;
    this.appName = "AI-Chat";
    this.version = VERSION;

    this.donateText = t("Donate");
    this.donateUrl = "page/DonateScreen";

    this.infoRows = [
      ["melianmiko", "Developer"],
      ["mmk.pw", "Website"],
    ];
  }
}

Page({
  onInit(p) {
    new AboutScreen().start();
  }
});
