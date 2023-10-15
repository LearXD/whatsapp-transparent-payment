import { User } from "@prisma/client";
import BaileysCommand from "../utils/baileys/command";
import BaileysMessage from "../utils/baileys/message";
import MercadoPago from "../utils/mercado-pago";
import { formatDate } from "../utils/timer";
export default class MercadoPagoCommand extends BaileysCommand {
  constructor() {
    super("pix", "Gere um código QR para pix")
  }

  public async execute(command: string, args: string[], message: BaileysMessage, user: User) {

    if (!message.fromMe()) {
      return;
    }

    const [value] = args;

    if (!value) {
      await message.mark("Informe o valor do pagamento")
      return
    }

    await message.reply("⏳ Gerando código de pagamento...");
    const payment = await MercadoPago.createPayment(parseFloat(value), "Teste", "contato@learxd.dev", user.id);

    if (!payment.id) {
      message.reply("❌ Não foi possível criar o pagamento, ID não encontrado")
      return
    }

    // await message.reply(`✔ Código Gerado com sucesso! ID da compra #${payment.id}`)

    await message.reply({
      image: Buffer.from(payment.point_of_interaction.transaction_data.qr_code_base64, 'base64'),
      caption: `
  🏷 QrCode Gerado com Sucesso

  📝 ID da compra: #${payment.id}
  💰 Valor: R$ ${payment.transaction_amount}
  ⏳ Expira em: ${formatDate(new Date(payment.date_of_expiration))}

  Ou pague pelo *PIX Copia e Cola*
  👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
  `
    })
    await message.reply(payment.point_of_interaction.transaction_data.qr_code)

    await message.reply(`Irei te avisar quando o pagamento for aprovado 😊...`)
  }
}