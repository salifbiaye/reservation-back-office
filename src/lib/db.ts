import { PrismaClient } from '../../prisma/generated/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

let prismaInstance: PrismaClient | undefined

export const db = (() => {
    if (!prismaInstance) {
        prismaInstance = globalForPrisma.prisma || new PrismaClient()
        if (process.env.NODE_ENV !== "production") {
            globalForPrisma.prisma = prismaInstance
        }
    }
    return prismaInstance
})()