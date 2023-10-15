import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys'

import path from "path"
import BaileysBot from './baileys-bot'
import BaileysMessage from './message'

export default class BaileysSession {

  private instance: ReturnType<typeof makeWASocket>

  constructor(private handler: BaileysBot) { }

  public async init() {
    return new Promise(async (resolve) => {
      const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "..", "..", "..", "auth_info_data"))
      this.instance = makeWASocket({ auth: state, printQRInTerminal: true })

      this.instance.ev.on('connection.update', (update) => {
        const { connection } = update
        if (connection === 'close') {
          this.handler.emit('connection.closed', update)
          this.init();
        } else if (connection === 'open') {
          this.handler.emit('connection.opened', update)
        }
      })

      this.instance.ev.on("messages.upsert", ({ messages }) => {
        messages.forEach(message => this.handler.emit("message", BaileysMessage.from(message, this.handler)))
      });

      this.instance.ev.on("creds.update", saveCreds);
      resolve(undefined);
    })
  }

  public getEvents() {
    if (!this.instance) {
      throw new Error("Instance not initialized")
    }
    return this.instance.ev;
  }

  public getInstance() {
    if (!this.instance) {
      throw new Error("Instance not initialized")
    }
    return this.instance;
  }
}