import {TemplateSplashScreen} from "mzfw/device/TemplateSplashScreen";
import {SERVER_BASE_URL} from "./shared/constants";
import {getRequestHeaders} from "./shared/Tools";
import {ServerInitResponse} from "./types/ServerResponse";
import {getText as t} from "mzfw/zosx/i18n";

class SplashScreen extends TemplateSplashScreen {
    protected continueToUrl: string = "page/HomePageScreen";

    protected onInit(): Promise<void> {
        let resp: Response;
        this.setStatus(t("Processing..."));

        return fetch(`${SERVER_BASE_URL}/api/v2/init`, {
            headers: getRequestHeaders()
        }).then((r) => {
            resp = r;
            if(resp.status == 0 || resp.status >= 500) {
                // Offline
                this.continueParam = JSON.stringify({isOnline: false});
                return null;
            }
            return r.json();
        }).then((body: ServerInitResponse) => {
            if(body == null) return;
            if(!body.result) {
                this.setStatus(body.error);
                throw new Error(body.error);
            }

            for(const key in body.config) {
                console.log("Write config", key, body.config[key]);
                localStorage.setItem(key, body.config[key]);
            }

            this.continueParam = JSON.stringify({isOnline: true, news: body.news});
        }).catch((e) => {
            console.log("err", e);
            this.continueParam = JSON.stringify({isOnline: false});
            return null;
        })
    }
}

Page(SplashScreen.makePage(new SplashScreen()));
