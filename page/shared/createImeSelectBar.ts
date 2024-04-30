import {ActionBar, ActionBarItem} from "mzfw/device/UiActionBar";
import {push, replace} from "mzfw/zosx/router";
import {zeppFeatureLevel} from "mzfw/device/System";

export function createImeSelectBar(id: string, useReplace: boolean = true): ActionBar {
  const handler = useReplace ? replace : push;

  const items: ActionBarItem[] = [{
      icon: "keyboard",
      onClick: () => continueToIME("page/InputKeyboardScreen"),
  }];

  if(zeppFeatureLevel >= 3) items.push({
    icon: "voice",
    onClick: () => continueToIME("page/InputVoiceScreen"),
  });

  function continueToIME(url: string) {
    handler({
      url: localStorage.getItem("privacyStatementRead") ? url : "page/PrivacyWarningScreen",
      params: JSON.stringify({id: id, text: "", continueUrl: url}),
    })
  }

  return new ActionBar({
    children: items,
  });
}
