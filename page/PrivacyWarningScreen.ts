import {ListView} from "mzfw/device/UiListView";
import {Component} from "mzfw/device/UiComponent";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {getText as t} from "mzfw/zosx/i18n";
import {AiChatTheme} from "./shared/AiChatTheme";
import {Button, ButtonVariant} from "mzfw/device/UiButton";
import {replace} from "mzfw/zosx/router";

class PrivacyWarningScreen extends ListView<{}> {
  public theme = new AiChatTheme();

  protected build(): (Component<any> | null)[] {
    return [
      new TextComponent({
        text: t("Before using this app..."),
        color: 0xFF9900,
        textSize: this.theme.FONT_SIZE + 4,
        marginV: 6,
      }),
      new TextComponent({
        text: t("All data that you provide to this application will be sent to OpenAI to proceed with GPT-3 AI model. " +
          "Keep in mind that all conversions may be used by OpenAI team to train next generations of ChatGPT. Do not share " +
          "any personal or secret information with ChatGPT."),
        marginV: 4,
      }),
      new TextComponent({
        text: t("Also, keep in mind that ChatGPT isn't totally perfect, and it can generate incorrect information, " +
          "may produce offensive or biased content. Developer of \"AI-Chat\" only provide access to ChatGPT, and didn't " +
          "responsible for any content that is generated with this tool."),
        marginV: 4,
      }),
      new TextComponent({
        text: t("Continue only of you agree with all of this"),
        color: 0x999999,
        marginV: 4,
      }),
      new Button({
        text: t("Continue"),
        variant: ButtonVariant.DEFAULT,
        onClick: () => {
          localStorage.setItem("privacyStatementRead", "true");
          replace({
            url: "page/ChatViewScreen",
            params: JSON.stringify(this.props)
          });
        }
      }),
    ];
  }
}

Page(ListView.makePage(new PrivacyWarningScreen({})));
