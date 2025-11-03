"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { DataSearch } from "@/components/data-search"
import { DataFilter } from "@/components/data-filter"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Plus } from "lucide-react"
import { CreateUserModal, UpdateUserModal, EditUserCommissionModal, DeleteUserModal } from "./users-modals"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
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

interface UsersContentProps {
  result: {
    data: User[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
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

export function UsersContent({ result }: UsersContentProps) {
  const router = useRouter()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleUpdate = (user: User) => {
    setSelectedUser(user)
    setUpdateModalOpen(true)
  }

  const handleEditCommission = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      label: "Nom",
      className: "font-medium",
      render: (_, user) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
      ),
    },
    {
      key: "email",
      label: "Email",
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

  const getActions = (user: User): RowAction<User>[] => {
    const actions: RowAction<User>[] = []
    if (user.role !== "ADMIN") {
      actions.push({
        label: "Modifier",
        onClick: handleUpdate,
        variant: "default",
      })
    }

    actions.push({
      label: "Modifier commission",
      onClick: handleEditCommission,
      variant: "default",
    })

    if (user.role !== "ADMIN") {
      actions.push({
        label: "Supprimer",
        onClick: handleDelete,
        variant: "destructive",
      })
    }

    return actions
  }

  return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau utilisateur
          </Button>
        </div>

        <DataTable
            data={result.data}
            columns={columns}
            getActions={getActions}
            headerContent={
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <DataSearch placeholder="Rechercher un utilisateur..." />
                </div>
                <DataFilter
                    extraFilters={[
                      {
                        type: "select",
                        name: "role",
                        label: "Rôle",
                        options: [
                          { label: "Tous", value: "" },
                          { label: "Étudiant", value: "STUDENT" },
                          { label: "Membre CEE", value: "CEE" },
                          { label: "Administrateur", value: "ADMIN" },
                        ],
                      },
                    ]}
                />
              </div>
            }
            footerContent={
              <DataPagination totalItems={result.pagination.total} />
            }
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            }
        />

        {/* Modals */}
        <CreateUserModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSuccess={handleRefresh}
        />

        {selectedUser && (
            <>
              <UpdateUserModal
                  isOpen={updateModalOpen}
                  onClose={() => setUpdateModalOpen(false)}
                  onSuccess={handleRefresh}
                  user={selectedUser}
              />

              <EditUserCommissionModal
                  isOpen={editModalOpen}
                  onClose={() => setEditModalOpen(false)}
                  onSuccess={handleRefresh}
                  user={selectedUser}
              />

              <DeleteUserModal
                  isOpen={deleteModalOpen}
                  onClose={() => setDeleteModalOpen(false)}
                  onSuccess={handleRefresh}
                  user={selectedUser}
              />
            </>
        )}
      </div>
  )
}