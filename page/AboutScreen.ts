import {TemplateAboutPage} from "mzfw/device/TemplateAboutPage";
import {getText, getText as t} from "@zosx/i18n";
import {AiChatTheme} from "./shared/AiChatTheme";
import {ZeusxBundle} from "mzfw/device/System";
import {Component} from "mzfw/device/UiComponent";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {push} from "@zosx/router";

class AboutScreen extends TemplateAboutPage {
  public theme = new AiChatTheme();

  protected displayName: string = "Ai Chat";
  protected buildInfo: ZeusxBundle = BUNDLE;
  protected displayVersion: string = BUNDLE.APP_VERSION;

  // noinspection JSNonASCIINames
  protected authors: { [name: string]: string; } = {
    "MelianMiko": t("Main developer"),
    "yarchefisʸᵗ": t("Icon designer"),
  };

  protected i18n(sourceString: string): string {
    return getText(sourceString);
  }

  protected extraItems(): Component<any>[] {
    return [
      new Button({
        text: getText("Donate"),
        variant: ButtonVariant.DEFAULT,
        onClick: () => push({
          url: "page/DonateScreen",
          params: "",
        })
      }),
    ];
  }
}

Page(TemplateAboutPage.makePage(new AboutScreen(null)));
