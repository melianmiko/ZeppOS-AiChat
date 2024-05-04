import {Component} from "mzfw/device/UiComponent";
import {BaseCompositor} from "mzfw/device/UiCompositor";
import {IS_BAND_7, IS_SMALL_SCREEN_DEVICE, SCREEN_HEIGHT, SCREEN_MARGIN, WIDGET_WIDTH} from "mzfw/device/UiProperties";
import {getText as t} from "@zosx/i18n";
import {createImeSelectBar} from "../page/shared/createImeSelectBar";
import {TextComponent} from "mzfw/device/UiTextComponent";
import {align} from "@zosx/ui";
import { AiChatTheme } from "../page/shared/AiChatTheme";

class AiChatWidget extends BaseCompositor<{}> {
  protected internalTickDelay: number = 0;
  public theme = new AiChatTheme();

  performRender() {
    super.performRender();
    const margin = IS_SMALL_SCREEN_DEVICE ? 16 : 24;

    // IME Select bar
    const imeBarHeight = this.addComponent(createImeSelectBar("0", false), -margin);

    // Info text
    this.addComponent(new TextComponent({
      text: t("Ask your question here to start new AI Chat dialog"),
      color: this.theme.ACCENT_COLOR_LIGHT,
      textSize: this.theme.FONT_SIZE - (IS_BAND_7 ? 2 : 6),
      alignH: align.CENTER_H,
      alignV: align.BOTTOM,
    }), 48 + (margin * 2), SCREEN_HEIGHT - 48 - imeBarHeight - (margin * 4))
  }

  /**
   * Add component to widget
   *
   * @param component Component entry
   * @param y Vertical position
   * @param height Propagated height
   * @private
   */
  private addComponent(component: Component<any>, y: number, height: number | null = null) {
    component.attachParent(this);
    component.setGeometry(null, null, WIDGET_WIDTH, null);

    const ph = height ?? component.geometry.h;
    const py = y >= 0 ? y : SCREEN_HEIGHT - ph + y;
    component.setGeometry(SCREEN_MARGIN, py, WIDGET_WIDTH, ph);
    component.performRender();

    this.nestedComponents.push(component);
    return component.geometry.h;
  }

  onChildHeightChanged(child: Component<any>): void {}
}

SecondaryWidget(BaseCompositor.makePage(new AiChatWidget({})))
