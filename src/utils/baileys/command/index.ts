import { proto } from '@whiskeysockets/baileys';
import BaileysMessage from '../message';

export default abstract class BaileysCommand {
  constructor(
    private name: string,
    private description?: string,
    private aliases: string[] = [],
  ) { }

  public getName() {
    return this.name;
  }

  public getDescription() {
    return this.description;
  }

  public getAliases() {
    return [...this.aliases, this.name];
  }

  public async execute(command: string, args: string[], message: BaileysMessage, ...parsedArgs: any) { }
}