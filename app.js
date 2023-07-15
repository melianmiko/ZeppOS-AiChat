import "./lib/zeppos/device-polyfill";
import { clientFetch, prepareFetch } from "./lib/mmk/FetchForward";
import { MessageBuilder } from "./lib/zeppos/message";
import {FsTools} from "./lib/mmk/Path";
import {ConfigStorage} from "./lib/mmk/ConfigStorage";

const appId = 1029480;
FsTools.appTags = [appId, "app"];

const messageBuilder = new MessageBuilder({ appId })
const config = new ConfigStorage();

App({
  globalData: {
    fetch: clientFetch,
    messageBuilder,
    config,
    appTags: FsTools.appTags
  },
  onCreate(options) {
    console.log('app on create invoke');
    messageBuilder.connect()
    config.load();

    prepareFetch(messageBuilder);

    messageBuilder.request({action: "ping"});
  },

  onDestroy(options) {
    console.log('app on destroy invoke')
  }
})