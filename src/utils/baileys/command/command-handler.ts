import BaileysBot from "../baileys-bot";
import BaileysCommand from ".";
import BaileysMessage from "../message";
import { BaileysCommandParser, BaileysCommandsHandlerConfig } from "./types";

export default class BaileysCommandsHandler {

  private registeredCommands: BaileysCommand[] = [];
  private commandParser: BaileysCommandParser;

  constructor(private handler: BaileysBot, private config: BaileysCommandsHandlerConfig = {}) { }

  public async init() {
    if (this.registeredCommands.length > 0) {
      return;
    }
  }

  private existsCommands(commands: string[]) {
    return this.registeredCommands.find(command => {
      return command.getAliases().some(alias => commands.includes(alias));
    });
  }

  public findCommand(commandName: string) {
    return this.registeredCommands.find(command => {
      return command.getAliases().includes(commandName);
    });
  }

  public registerCommand(command: BaileysCommand) {
    if (this.existsCommands(command.getAliases())) {
      throw new Error(`Command ${command.getName()} already exists`);
    }

    this.registeredCommands.push(command);
    return true;
  }

  public registerCommands(commands: BaileysCommand[]) {
    commands.forEach(command => this.registerCommand(command));
    return true;
  }

  public setCommandParser(parser: BaileysCommandParser) {
    return this.commandParser = parser;
  }

  public async executeCommand(message: BaileysMessage) {
    const text = message.getText();

    if (!text || message.isBroadcast()) return;

    const args = text.split(" ");
    const command = args.shift();

    if (this.config.prefix && !command.startsWith(this.config.prefix)) {
      return;
    }

    const commandName = command.replace(this.config.prefix, "");
    const commandClass = this.findCommand(commandName);

    if (!commandClass) {
      return;
    }

    let parsedArgs: any[] = [];

    try {
      if (this.commandParser) {
        parsedArgs = await this.commandParser(commandName, args, message);
      }
      await commandClass.execute(commandName, args, message, ...parsedArgs);
    } catch (error) {
      console.log(error);
      throw new Error(`Error executing command ${commandName}`);
    }

  }
}