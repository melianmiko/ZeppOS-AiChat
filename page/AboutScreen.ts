import {TemplateAboutPage} from "mzfw/device/TemplateAboutPage";
import {getText, getText as t} from "mzfw/zosx/i18n";
import {AiChatTheme} from "./shared/AiChatTheme";
import {ZeusxBundle} from "mzfw/device/System";

// noinspection JSNonASCIINames
class AboutScreen extends TemplateAboutPage {
  public theme = new AiChatTheme();

  protected displayName: string = "Ai Chat";
  protected buildInfo: ZeusxBundle = BUNDLE;
  protected displayVersion: string = BUNDLE.APP_VERSION;
  protected authors: { [name: string]: string; } = {
    "MelianMiko": t("Main developer"),
    "yarchefisʸᵗ": t("Icon designer"),
  };

  protected i18n(sourceString: string): string {
    return getText(sourceString);
  }
}

Page(TemplateAboutPage.makePage(new AboutScreen(null)));
