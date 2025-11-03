"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { deleteUser } from "@/actions/users"
import { toast } from "sonner"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface User {
  id: string
  name: string
  email: string
  emailVerified: Date | null
  role: string
  commission: {
    id: string
    name: string
    color: string
  } | null
  _count: {
    reservations: number
  }
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
}

const roleLabels = {
  STUDENT: "Étudiant",
  CEE: "Membre CEE",
  ADMIN: "Administrateur",
}

const roleVariants = {
  STUDENT: "secondary" as const,
  CEE: "default" as const,
  ADMIN: "destructive" as const,
}
const getInitials = (name?: string | null) => {
  if (!name) return "?"
  return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
}


export function UsersTable({ users }: UsersTableProps) {
  const handleDelete = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${user.name}" ?`)) {
      return
    }

    const result = await deleteUser(user.id)
    if (result.success) {
      toast.success("Utilisateur supprimé avec succès")
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      label: "Nom",
      className: "font-medium",
    },
    {
      key: "email",
      label: "Email",
      render: (user) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span>{user.email}</span>
          </div>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      render: (value) => {
        const role = value as keyof typeof roleLabels
        return (
          <Badge variant={roleVariants[role]}>
            {roleLabels[role]}
          </Badge>
        )
      },
    },
    {
      key: "commission",
      label: "Commission",
      render: (_, item) => {
        if (!item.commission) return "-"
        return (
          <Badge
            variant="outline"
            style={{ borderColor: item.commission.color }}
          >
            {item.commission.name}
          </Badge>
        )
      },
    },
    {
      key: "reservations_count",
      label: "Réservations",
      render: (_, item) => item._count.reservations,
    },
    {
      key: "createdAt",
      label: "Inscription",
      render: (value) => format(new Date(value), "PP", { locale: fr }),
    },
  ]

  const actions: RowAction<User>[] = [
    {
      label: "Supprimer",
      onClick: handleDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      emptyState={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      }
    />
  )
}
