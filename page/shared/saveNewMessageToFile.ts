import {ServerChatResponse} from "../types/ServerResponse";
import {ConfigStorage} from "mzfw/device/Path";
import {ChatListRecord, ChatMessageRecord} from "../types/ConfigStorageTypes";

export function saveNewMessageToFile(data: ServerChatResponse, message?: string) {
  // Message list load
  const chatDataStorage = new ConfigStorage(data.context_id + ".json");
  const messages: ChatMessageRecord[] = chatDataStorage.getItem("messages") ?? [];

  // Chat list management
  if(messages.length == 0) {
    const listStorage = new ConfigStorage("chat_list.json");
    const chats: ChatListRecord[] = listStorage.getItem("chats") ?? [];
    chats.push({
      id: data.context_id,
      name: message,
    })
    listStorage.setItem("chats", chats);
    listStorage.writeChanges();
  }

  // Handle data
  messages.push({role: "user", content: message});
  if(data.server_message) messages.push(data.server_message);
  messages.push({role: "assistant", content: "..."});
  chatDataStorage.setItem("messages", messages);
  chatDataStorage.writeChanges();
}
