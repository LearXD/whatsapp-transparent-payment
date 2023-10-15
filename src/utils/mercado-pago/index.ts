import MercadoPagoConfig, { Payment } from "mercadopago";
import prisma from "../prisma";
import ENV from "../env"
import BaileysBot from "../baileys/baileys-bot";
import { delay } from "@whiskeysockets/baileys";
import { isExpired } from "../timer";

export default class MercadoPago {

  static paymentChecker: NodeJS.Timeout | null = null;

  public static getClient() {
    return new MercadoPagoConfig({ accessToken: ENV.getMercadoPagoToken() });
  }

  public static getPaymentsManager() {
    return new Payment(this.getClient())
  }

  public static async getPayment(id: string) {
    return this.getPaymentsManager().get({ id })
  }

  public static async createPayment(amount: number, description: string, payerEmail: string, userId: number) {

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

    if (payment || payment.status === "pending") {
      const register = await prisma.payment.create({
        data: {
          paymentId: `${payment.id}`,
          status: payment.status,
          userId,
          amount,
          expiresAt: payment.date_of_expiration
        }
      })
      if (!register) {
        throw new Error("Não foi possível registrar o pagamento")
      }
    }
    return payment
  }

  public static initPaymentChecker(
    broadcaster: BaileysBot,
    interval: number = 5000
  ) {

    if (this.paymentChecker) {
      clearTimeout(this.paymentChecker);
    }

    const check = async () => {
      console.log("Checking payments...")

      const pending = await prisma.payment.findMany({
        where: {
          status: "pending",
          'OR': [
            {
              'notified': false
            }
          ]
        }
      })

      for await (const payment of pending) {
        const paymentData = await this.getPayment(payment.paymentId)

        console.log(`Payment ${payment.paymentId} status: ${paymentData.status}`)
        const user = await prisma.user.findUnique({ where: { id: payment.userId } })

        if (paymentData.status === "approved") {
          await broadcaster.sendMessage(user.number, `✔ PIX #${paymentData.id} no valor de R$ ${paymentData.transaction_amount} aprovado!`)
          await prisma.payment.update({ where: { id: payment.id }, data: { status: paymentData.status, notified: true } })
        }

        if (
          paymentData.status === "cancelled" ||
          paymentData.status === "expired" ||
          isExpired(payment.expiresAt)
        ) {
          await broadcaster.sendMessage(user.number, `❌ PIX #${paymentData.id} no valor de R$ ${paymentData.transaction_amount} expirou ou foi cancelado!`)
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "expired", notified: true } })
        }

        await delay(5000);
      }

      this.initPaymentChecker(broadcaster, interval)
    }

    this.paymentChecker = setTimeout(check, interval)
  }
} 
