import { Prisma, PrismaClient, User, Payment } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;
export { Prisma, PrismaClient, User, Payment }