import MercadoPagoConfig, { Payment as MercadoPagoPayment } from "mercadopago";
import ENV from "../env"
import BaileysBot from "../baileys/baileys-bot";
import { delay } from "@whiskeysockets/baileys";
import Payment from "../mercado-pago/utils/payment"
import User from "./utils/user";
import { formatDate } from "../timer";

export default class MercadoPago {

  static paymentChecker: NodeJS.Timeout | null = null;

  public static getClient() {
    return new MercadoPagoConfig({ accessToken: ENV.getMercadoPagoToken() });
  }

  public static getPaymentsManager() {
    return new MercadoPagoPayment(this.getClient())
  }

  public static async getPayment(id: string) {
    return this.getPaymentsManager().get({ id })
  }

  public static async createPayment(amount: number, description: string, payerEmail: string, userId: number) {

    const user = await User.findById(userId)

    if ((await user.getPendingPayments()).length > 0) {
      throw new Error("Você já possui um pagamento pendente!")
    }

    const payment = await this.getPaymentsManager().create({
      body: {
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail
        }
      }
    });

    if (!payment || Object.keys(payment).find(key => key === "error")) {
      throw new Error("Não foi solicitar o pagamento")
    }

    const register = await Payment.create({
      paymentId: `${payment.id}`,
      status: payment.status,
      userId,
      amount,
      expiresAt: payment.date_of_expiration
    })

    if (!register) {
      throw new Error("Não foi possível registrar o pagamento")
    }

    return payment
  }

  public static initPaymentChecker(
    broadcaster: BaileysBot,
    interval: number = 60 * 1000
  ) {

    const check = async () => {

      const expired = await Payment.getExpiredPayments()

      for await (const payment of expired) {
        const user = await payment.getOwner()
        const paymentData = await this.getPayment(payment.getPaymentId())
        payment.setStatus(paymentData.status)
        await broadcaster.sendMessage(user.getPhone(), `❌ PIX #${paymentData.id} no valor de R$ ${paymentData.transaction_amount} expirou ou foi cancelado!`)
        await payment.update({ status: "expired", notified: true })
        await delay(2000);
      }

      const pending = await Payment.getPendingPayments()

      for await (const payment of pending) {
        const paymentData = await this.getPayment(payment.getPaymentId())
        payment.setStatus(paymentData.status)

        if (payment.isApproved()) {
          const user = await payment.getOwner()
          await broadcaster.sendMessage(
            user.getPhone(),
            `✔ PIX #${paymentData.id} no valor de R$ ${paymentData.transaction_amount} aprovado!`
          )
          await payment.update({ status: paymentData.status, notified: true })
        }
        await delay(2000);
      }

      this.initPaymentChecker(broadcaster, interval)
    }

    setTimeout(check, interval)
  }
} 
