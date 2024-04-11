import {TemplateSplashScreen} from "mzfw/device/TemplateSplashScreen";
import {SERVER_BASE_URL} from "./shared/constants";

class SplashScreen extends TemplateSplashScreen {
    protected continueToUrl: string = "page/HomePageScreen";

    protected onInit(): Promise<void> {
        // Test server availability
        // TODO: v2 use status url
        return fetch(SERVER_BASE_URL).then((d) => {
            const isOnline = d.status == 200;
            this.continueParam = JSON.stringify({isOnline});
        });
    }
}

Page(SplashScreen.makePage(new SplashScreen()));
