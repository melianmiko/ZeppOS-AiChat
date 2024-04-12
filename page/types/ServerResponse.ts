import {ChatMessageRecord} from "./ConfigStorageTypes";

export type ServerChatResponse = {
  result: boolean,
  error: string,
  context_id: string,
  server_message?: ChatMessageRecord,
}

export type ServerNewsEntry = {
  id: number,
  title: string,
  message: string,
}

export type ServerInitResponse = {
  result: boolean,
  error: string,
  config: {[id: string]: string},
  news: ServerNewsEntry | null,
}

export type ServerLimitsResponse = {
  result: boolean,
  limits: {[tag: string]: number},
  usage: {[tag: string]: number},
}