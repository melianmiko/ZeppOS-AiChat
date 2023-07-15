import {MessageBuilder} from '../lib/zeppos/message';
import {handleFetchRequest, prepareFetch} from "../lib/mmk/FetchForward";

const messageBuilder = new MessageBuilder();

AppSideService({
  onInit(props) {
    prepareFetch(messageBuilder);

    messageBuilder.listen(() => {});
    messageBuilder.on("request", (ctx) => {
      const request = messageBuilder.buf2Json(ctx.request.payload);
      handleFetchRequest(ctx, request);
    });
  },
  onRun() {},
  onDestroy() {},
})
