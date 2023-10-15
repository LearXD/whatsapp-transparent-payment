import { Payment as PrismaPayment, Prisma } from "@prisma/client";
import prisma from "../../prisma";
import User from "./user";

export default class Payment {
  constructor(private data: PrismaPayment) { }

  public getData() {
    return this.data;
  }

  public getPaymentId() {
    return this.data.paymentId;
  }

  static async create(data: Prisma.PaymentUncheckedCreateInput) {
    if (!await prisma.user.findMany({ where: { id: data.userId } })) {
      throw new Error("User not found")
    }

    return prisma.payment.create({ data })
  }

  public static async findByPaymentId(id: string) {
    const found = await prisma.payment.findUnique({ where: { paymentId: id } })
    if (!found) {
      throw new Error("Payment not found")
    }
    return new Payment(found)
  }

  public static async findById(id: number) {
    const found = await prisma.payment.findUnique({ where: { id } })
    if (!found) {
      throw new Error("Payment not found")
    }
    return new Payment(found)
  }

  public static async getPendingPayments(userId?: number) {
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { notified: false },
          { status: "pending" }
        ],
        AND: [
          { userId }
        ]
      }
    });

    return payments.map(data => new Payment(data))
  }

  public static async getExpiredPayments() {
    const payments = await prisma.payment.findMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { notified: false }
        ]
      }
    });

    return payments.map(data => new Payment(data))
  }

  public setStatus(status: string) {
    return this.data.status = status
  }

  public isApproved() {
    return this.data.status === "approved"
  }

  public isPending() {
    return this.data.status === "pending"
  }

  public isExpired() {
    return this.data.expiresAt <= new Date()
  }

  public getOwner() {
    return User.findById(this.data.userId)
  }

  public async update(data: Prisma.PaymentUncheckedUpdateInput) {
    return this.data = await prisma.payment.update({ where: { id: this.data.id }, data })
  }

}