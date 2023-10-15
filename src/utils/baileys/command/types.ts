import BaileysMessage from "../message";

export interface BaileysCommandsHandlerConfig {
  prefix?: string;
}

export type BaileysCommandParser = <T>(command: string, args: string[], message: BaileysMessage) => Promise<T | any[]>
export type BaileysCommandExecutor = <T>(command: string, args: string[], message: BaileysMessage, ...parsedArgs: any | T) => any