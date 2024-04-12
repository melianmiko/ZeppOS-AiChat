// @ts-ignore

export type ZeppMediaTypeEnum = {
  PLAYER,
  RECORDER,
}

export type ZeppMediaCodecEnum = {
  OPUS: number,
}

export interface ZeppMediaBaseEntry {
  start(): void;
  stop(): void;
  addEventListener(event: number, callback: () => any): void;
}

export interface ZeppMediaInfo {
  title?: string,
  artist?: string,
  duration: number,
}

export interface ZeppMediaPlayer extends ZeppMediaBaseEntry {
  source: {
    FILE: number,
  };
  event: {
    PREPARE: number,
    COMPLETE: number,
  };
  state: {
    IDLE: number,
    INITIALIZED: number,
    PREPARING: number,
    PREPARED: number,
    STARTED: number,
    PAUSED: number,
    STOPPED: number,
  }
  setSource(source: number, obj: {file: string}): void;
  prepare(): void;
  release(): void;
  getStatus(): number;
  getDuration(): number;
  getVolume(): number;
  setVolume(vol: number): boolean;
  getTitle(): string | undefined;
  getArtist(): string | undefined;
  getMediaInfo(): ZeppMediaInfo;
}

export interface ZeppMediaRecorder extends ZeppMediaBaseEntry {
  setFormat(codec: number, param: {target_file: string}): void;
}

export interface ZeppMediaLibrary {
  id: ZeppMediaTypeEnum;
  codec: ZeppMediaCodecEnum,
  create<P = ZeppMediaPlayer | ZeppMediaRecorder>(id: ZeppMediaTypeEnum): P;
}
