import {gettext} from 'i18n';
import {Headline} from "./views/Headline";
import {Paragraph, Paragraph2} from "./views/Paragraph";
import {VERSION} from "../version";
import {URL_TO_COPY} from "./styles";

AppSettingsPage({
  build(props) {
    return View({
      style: {
        margin: "8px"
      }
    }, [
        Headline(gettext("About")),
        Paragraph([
            Text({}, `AI-Chat ${VERSION} by MelianMiko`)
        ]),
        Paragraph2([
            Text({}, gettext("This application isn't developed or affiliated by OpenAI, it only uses their technologies."))
        ]),
        Paragraph2([
            Text({}, gettext("By using this application, you agree with OpenAI Privacy policy: ")),
            Text(URL_TO_COPY, "https://openai.com/policies/privacy-policy")
        ]),
        Paragraph2([
            Text({}, gettext("Like this application? Consider to support their development with a small donation: ")),
            Text(URL_TO_COPY, "https://mmk.pw/donate")
        ]),
        Paragraph2([
            Text({}, gettext("Want to see AI-Chat interface into another language? You can help us with translation: ")),
            Text(URL_TO_COPY, "https://crowdin.com/project/zeppchat")
        ]),
    ]);
  },
})
