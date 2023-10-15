
import EventEmitter from "events";
import { BaileysBotConfig } from "./types";

import BaileysSession from "./session";
import BaileysCommandsHandler from "./command/command-handler";
import BaileysMessage from "./message";

import { AnyMessageContent, MiscMessageGenerationOptions } from "@whiskeysockets/baileys"

export default class BaileysBot extends EventEmitter {

  private session: BaileysSession;
  private commandsHandler: BaileysCommandsHandler

  constructor(private config?: BaileysBotConfig) {
    super()
  }

  async start() {
    return new Promise(async (resolve) => {

      this.session = new BaileysSession(this)
      await this.session.init()

      this.commandsHandler = new BaileysCommandsHandler(this, {
        prefix: this.config?.commandPrefix
      })
      this.commandsHandler.init()

      this.on("message", async (message: BaileysMessage) => {
        await this.commandsHandler.executeCommand(message)
      });

      resolve(undefined)
    });
  }

  public sendMessage(
    to: string,
    content: AnyMessageContent | string,
    options?: MiscMessageGenerationOptions
  ) {
    return this.getSession().getInstance().sendMessage(
      to,
      typeof content === "string" ? { text: content } : content,
      options
    )
  }

  public getSession() {
    return this.session;
  }

  public getCommandsHandler() {
    return this.commandsHandler;
  }
}