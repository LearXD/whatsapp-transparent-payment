import { User as PrismaUser } from '@prisma/client'
import Payment from './payment';
import prisma from '../../prisma';

export default class User {
  constructor(private readonly data: PrismaUser) { }

  public getPhone() {
    return this.data.number;
  }

  public static async findById(id: number) {
    const found = await prisma.user.findUnique({ where: { id } });
    if (!found) {
      throw new Error("User not found")
    }
    return new User(found)
  }

  public static async findByPhone(phone: string) {
    const found = await prisma.user.findUnique({ where: { number: phone } })
    if (!found) {
      throw new Error("User not found")
    }
    return new User(found)
  }

  public getData() {
    return this.data;
  }

  public async getPendingPayments() {
    return Payment.getPendingPayments(this.data.id)
  }

}