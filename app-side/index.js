import {initMessaging} from "mzfw/shared/SideMessaging";
import {defineAppTags} from "mzfw/shared/AppTagsProvider";
import {initFetchProvider} from "mzfw/shared/SideFetchProvider";

AppSideService({
  onInit() {
    console.log(111);
    defineAppTags("app", 1029480);
    initMessaging();
    console.log(222);
    initFetchProvider();
    console.log(333);
  },

  onDestroy() {
    console.log("Bye-bye.");
  }
})
