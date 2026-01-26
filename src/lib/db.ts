import { PrismaClient } from '../../prisma/generated/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

let prismaInstance: PrismaClient | undefined

export const db = (() => {
    if (!prismaInstance) {
        prismaInstance = globalForPrisma.prisma || new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        })
        if (process.env.NODE_ENV !== "production") {
            globalForPrisma.prisma = prismaInstance
        }
    }
    return prismaInstance
})()

// Cleanup on process termination
if (typeof window === 'undefined') {
    const cleanup = async () => {
        if (prismaInstance) {
            await prismaInstance.$disconnect()
        }
    }

    process.on('beforeExit', cleanup)
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
}