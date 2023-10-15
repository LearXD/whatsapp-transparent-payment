import { proto, downloadMediaMessage, AnyMessageContent, MiscMessageGenerationOptions } from '@whiskeysockets/baileys';
import BaileysBot from '../baileys-bot';

const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']

export default class BaileysMessage {

  public text: string = "";
  private message = this.data.message;

  constructor(private data: proto.IWebMessageInfo, private handler: BaileysBot) {
    this.parse()
  }

  static from(message: proto.IWebMessageInfo, handler: BaileysBot) {
    return new BaileysMessage(message, handler);
  }

  public getData() {
    return this.data;
  }

  private parse() {
    this.extractText();
  }

  public mark(content: AnyMessageContent | string) {
    return this.reply(content, { quoted: this.data })
  }

  public reply(content: AnyMessageContent | string, options?: MiscMessageGenerationOptions) {
    return this.handler.sendMessage(this.getFrom(), content, options);
  }

  public extractText() {
    const message = this.data.message;
    this.text = (
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      message?.imageMessage?.caption ||
      message?.videoMessage?.caption ||
      ""
    );
  }

  public async getMedia() {
    if (!this.message) return null;
    const [messageType] = Object.keys(this.message);
    if (MEDIA_TYPES.includes(messageType)) {
      return downloadMediaMessage(this.data, "buffer", {})
    }
    return null;
  }

  public isBroadcast() {
    return this.data.key.remoteJid.endsWith('@broadcast');
  }

  public getText() {
    return this.text;
  }

  public fromMe() {
    return this.data.key.fromMe;
  }

  public fromGroup() {
    return this.data.key.remoteJid.endsWith('@g.us');
  }

  public getFrom() {
    return this.data.key.remoteJid;
  }

  public getSenderNumber() {
    return this.getSender().split("@")[0];
  }

  public getSender() {
    return this.fromGroup() ? this.data.key.participant : this.data.key.remoteJid;
  }
}