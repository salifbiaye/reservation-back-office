import { Role } from "@prisma/client"

declare module "better-auth" {
  interface User {
    role: Role
    commissionId?: string | null
  }

  interface Session {
    user: User
  }
}
