import {ChatMessageRecord} from "./ConfigStorageTypes";

export type ServerChatResponse = {
  context_id: string,
  server_message?: ChatMessageRecord,
}
