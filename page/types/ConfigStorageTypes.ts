export type ChatListRecord = {
  id: string,
  name: string,
}

export type ChatMessageRecord = {
  role: "user" | "assistant" | string,
  content: string,
  finish_reason?: string,
}