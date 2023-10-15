import prisma, { Prisma } from "./prisma";

export default class UserRepository {

  static async getUserPendingPayment(userId: number) {
    return await prisma.payment.findFirst({
      where: {
        userId,
        status: "pending"
      }
    })
  }

  public static async checkUser(phone: string) {
    const user = await prisma.user.findUnique({ where: { number: phone } })
    if (!user) {
      return await prisma.user.create({ data: { number: phone } })
    }
    return user
  }

  static async createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    if (!await prisma.user.findMany({ where: { id: data.userId } })) {
      throw new Error("User not found")
    }
    if (await this.getUserPendingPayment(data.userId)) {
      throw new Error("User already have a pending payment")
    }
    return prisma.payment.create({ data })
  }
}