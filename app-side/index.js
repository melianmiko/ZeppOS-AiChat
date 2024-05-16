import {initMessaging} from "mzfw/shared/SideMessaging";
import {defineAppTags} from "mzfw/shared/AppTagsProvider";
import {initFetchProvider} from "mzfw/shared/SideFetchProvider";

AppSideService({
  onInit() {
    defineAppTags("app", 1029480);
    initMessaging();
    initFetchProvider();
  },

  onDestroy() {
    console.log("Bye-bye.");
  }
})
