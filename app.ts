import "mzfw/device_polyfill";

import {defineAppTags} from "mzfw/shared/AppTagsProvider";
import {initMessaging, sendRequestMessage} from "mzfw/shared/SideMessaging";
import {initFetchProvider} from "mzfw/shared/SideFetchProvider";
import {memoryCleanup} from "mzfw/device/System";

App({
  onCreate() {
    defineAppTags("app", 1029480);
    initMessaging();
    initFetchProvider();

    // Force bring side-service up
    sendRequestMessage({action: "ping"}).then(() => {});
  },

  onDestroy() {
    memoryCleanup();
  }
});
