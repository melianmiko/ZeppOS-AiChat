import {ActionBar} from "mzfw/device/UiActionBar";
import {push, replace} from "mzfw/zosx/router";

export function createImeSelectBar(id: string, useReplace: boolean = true): ActionBar {
  const handler = useReplace ? replace : push;

  function continueToIME(url: string) {
    handler({
      url: localStorage.getItem("privacyStatementRead") ? url : "page/PrivacyWarningScreen",
      params: JSON.stringify({id: id, text: "", continueUrl: url}),
    })
  }

  return new ActionBar({
    children: [
      {
        icon: "keyboard",
        onClick: () => continueToIME("page/InputKeyboardScreen"),
      },
      // TODO: Voice IME (v2 api)
    ]
  });
}
