import MercadoPagoCommand from "./commands/mercado-pago";
import BaileysBot from "./utils/baileys/baileys-bot";
import BaileysMessage from "./utils/baileys/message";
import MercadoPago from "./utils/mercado-pago";
import UserRepository from "./utils/users";

(async () => {

  // INIT INSTANCES
  const bot = new BaileysBot()
  await bot.start()

  // REGISTER EVENTS AND COMMANDS
  bot.getCommandsHandler().setCommandParser(
    async (command: string, args: string[], message: BaileysMessage) => {
      const user = await UserRepository.checkUser(message.getSender())
      if (!user) {
        throw new Error("Não foi possível criar um usuário para você!")
      }
      return [user];
    }
  );
  bot.getCommandsHandler().registerCommand(new MercadoPagoCommand())

  // INIT PAYMENT CHECKER
  MercadoPago.initPaymentChecker(bot, 5000)
})()
